// chrome.runtime.getBackgroundPage(function (backgroundPage) {
//   console.log(backgroundPage)
// })
$.ajaxSetup({ async: false })
var today = moment().format('DD/MM/YYYY')
var interval = setInterval(function () {
  var momentNow = moment()
  $('#date').html(momentNow.format('dddd, MMMM Do YYYY '))
  $('#time').html(momentNow.format('hh:mm:ss A'))
}, 100)
var scPlaylistTracks = []
var musicStatus = 'Playing'
var nowPlaying = null
var playListURL =
  'https://soundcloud.com/sebastian-lopez-49626625/sets/lofi-remixes'
var userURL = 'https://soundcloud.com/thekiadoe'
var ytVideosURL = 'https://www.youtube.com/c/THELOFIWIFISTATION/videos'
var socials = {
  youtube: 'https://www.youtube.com/c/THELOFIWIFISTATION',
  soundcloud: 'https://soundcloud.com/thelofiwifistation',
  spotify: 'https://open.spotify.com/playlist/7AbkW3uVMBclLgt7dG7jS2',
  instagram: 'https://www.instagram.com/thelofiwifistation',
  twitter: 'https://twitter.com/LofiWifiStation'
}
var youtubeVideos = []
var souncloudData = []
var musicButtons = [
  { action: 'stop', status: 'Stopped' },
  { action: 'play', status: 'Playing' },
  { action: 'pause', status: 'Paused' }
]

$(document).ready(function () {
  chrome.tabs.query({}, function (tabs) {
    console.log(tabs)
    $.map(tabs, function (v, i) {
      if (v.url.indexOf('youtube.com/watch') > 0) {
        var i = setInterval(function () {
          toggleVideo('stop')
          clearInterval(i)
        }, 500)
      }
    })
  })
  let videos = ytVideos()
  $.each(videos, function (i) {
    var li = $('<li/>', {
      class: 'list-group-item'
    }).appendTo($('.ytVideos'))
    var aaa = $('<a/>', {
      target: '_blank',
      text: videos[i].name,
      href: 'https://www.youtube.com/watch?v=' + videos[i].videoId
    }).appendTo(li)
  })
  $('#showSC').change(function () {
    showHideField($('.showSC'), this.checked)
    $('.list-group').css({ 'max-height': this.checked ? '235px' : '280px' })
  })
  $('svg').click(function () {
    toggleVideo(
      $(this)
        .attr('class')
        .split('-')[1]
    )
  })
  $('.socials a').each(function () {
    $(this).attr(
      'href',
      socials[
        $(this)
          .attr('class')
          .split('-')[1]
      ]
    )
  })
  $('.musicStatus p').text(musicStatus)
  $('.logo').attr('href', socials.youtube)
  $('.playlistScraper input').val(playListURL)
  $('.userScraper input').val(userURL)
  $('.playlistScraper button').click(function () {
    scPlaylist()
  })
  $('.userScraper button').click(function () {
    scUser()
  })
})

function showHideField (field, bool) {
  bool ? field.show() : field.hide()
}
function myTracks () {
  $.get(
    'https://api-v2.soundcloud.com/users/66593390/tracks?representation=&client_id=sqBVzKo4j9IoDkrB4lo2LJsSmZtfmUp5&limit=20&offset=0&linked_partitioning=1&app_version=1643299901&app_locale=en',
    function (res, status) {
      console.log(res.collection)
    }
  )
}
function ytVideos () {
  let youtubeVideos = []
  $.get(ytVideosURL, function (data, status) {
    youtubeVideos = $.map(
      getData(data, 32, 'var ytInitialData = ').contents
        .twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content
        .sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
        .gridRenderer.items,
      function (v, i) {
        return {
          name: v.gridVideoRenderer.title.runs[0].text,
          videoId: v.gridVideoRenderer.videoId
        }
      }
    )
    console.log(youtubeVideos)
    let liveStream = youtubeVideos.splice(
      youtubeVideos.findIndex(x => x.name.includes('24/7')),
      1
    )[0]
    $('.nowPlaying p').text(liveStream.name.split(' - ')[0])
    youtubeVideos.unshift(liveStream)
  })
  return youtubeVideos
}
function scUser () {
  soundcloudData = []
  $.get(userURL, function (data, status) {
    soundcloudData = getData(data, 9, 'window.__sc_hydration = ')
    console.log(soundcloudData)
    let user = getSCDataByKey('user')
    let tracks = scUserTracks(user.id)
    console.log(tracks)
    download(tracks, user.permalink + ' - tracks.json')
  })
}
function scUserTracks (id) {
  // console.log(id)
  return $.get(
    'https://api-v2.soundcloud.com/users/' +
      id +
      '/tracks?representation=&client_id=sqBVzKo4j9IoDkrB4lo2LJsSmZtfmUp5&limit=20&offset=0&linked_partitioning=1&app_version=1643299901&app_locale=en',
    function (res, status) {
      return res
    }
  ).responseJSON.collection
}
function scPlaylist () {
  soundcloudData = []
  $.get(playListURL, function (data, status) {
    soundcloudData = getData(data, 9, 'window.__sc_hydration = ')
    console.log(soundcloudData)
    let playlist = getSCDataByKey('playlist')
    console.log(playlist)
    $.each(
      chunk(
        $.map(playlist.tracks, function (v, i) {
          return v.id
        }),
        24
      ),
      function (i, ids) {
        scrapeScPlaylistTracks(encodeURIComponent(ids))
      }
    )
    download(scPlaylistTracks, playlist.title + '.json')
  })
}
function scrapeScPlaylistTracks (ids) {
  // console.log(ids)
  $.get(
    'https://api-v2.soundcloud.com/tracks?ids=' +
      ids +
      '&client_id=sqBVzKo4j9IoDkrB4lo2LJsSmZtfmUp5&%5Bobject%20Object%5D=&app_version=1643299901&app_locale=en',
    function (res, status) {
      scPlaylistTracks = merge(scPlaylistTracks, res)
      console.log(scPlaylistTracks)
    }
  )
}
function toggleVideo (action) {
  $('.yt_player_iframe').each(function () {
    this.contentWindow.postMessage(
      '{"event":"command","func":"' + action + 'Video","args":""}',
      '*'
    )
  })
  $('.musicStatus p').text(
    $.grep(musicButtons, function (v, i) {
      return v.action === action
    })[0].status
  )
}

function download (data, fileName) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], {
      type: 'text/plain'
    })
  )
  a.setAttribute('download', fileName)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function createDom (data) {
  const parser = new DOMParser()
  return parser.parseFromString(data, 'text/html')
}

function getData (data, index, string) {
  return JSON.parse(
    $(createDom(data))[0]
      .scripts[index].innerText.slice(0, -1)
      .replace(string, '')
  )
}

function getSCDataByKey (key) {
  return $.grep(soundcloudData, function (v, i) {
    return v.hydratable === key
  })[0].data
}

function chunk (array, size) {
  let result = []
  for (value of array) {
    let lastArray = result[result.length - 1]
    if (!lastArray || lastArray.length == size) {
      result.push([value])
    } else {
      lastArray.push(value)
    }
  }
  return result
}

const merge = (first, second) => {
  for (let i = 0; i < second.length; i++) {
    first.push(second[i])
  }
  return first
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}
