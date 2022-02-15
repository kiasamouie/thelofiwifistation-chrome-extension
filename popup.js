// chrome.runtime.getBackgroundPage(function (backgroundPage) {
//   console.log(backgroundPage)
// })
$.ajaxSetup({ async: false })
InitDateTime()
var scPlaylistTracks = []
var youtubeVideos = []
var souncloudData = []
var musicStatus = 'Playing'
var liveStream
var nowPlaying = ''
var playListURL = ''
var userURL = ''
var ytVideosURL = 'https://www.youtube.com/c/THELOFIWIFISTATION/videos'
var socials = {
  youtube: 'https://www.youtube.com/c/THELOFIWIFISTATION',
  soundcloud: 'https://soundcloud.com/thelofiwifistation',
  spotify: 'https://open.spotify.com/playlist/7AbkW3uVMBclLgt7dG7jS2',
  instagram: 'https://www.instagram.com/thelofiwifistation',
  twitter: 'https://twitter.com/LofiWifiStation'
}
var musicButtons = {
  stop: 'Stopped',
  play: 'Playing',
  pause: 'Paused'
}
var videos
var videoParams = {
  autoplay: 1,
  enablejsapi: 1,
  version: 3,
  playerapiid: 'ytplayer'
}

$(document).ready(function () {
  videos = ytVideos()
  populateYoutubeVideos()
  checkYoutubeWatchUrl()
  InitEventHandlers()
  populateSocials()
  $('.musicStatus p').text(musicStatus)
})

function Class (className, substr) {
  return className.indexOf(substr) > 0
}

function InitDateTime () {
  var interval = setInterval(function () {
    var now = moment()
    $('#date').html(now.format('dddd, MMMM Do YYYY '))
    $('#time').html(now.format('HH:mm:ss A'))
  }, 100)
}

function checkYoutubeWatchUrl () {
  chrome.tabs.query({}, function (tabs) {
    $.map(tabs, function (v, i) {
      if (v.url.includes('youtube.com/watch')) {
        var i = setInterval(function () {
          toggleVideo('stop')
          clearInterval(i)
        }, 500)
      }
    })
  })
}

function populateYoutubeVideos () {
  $.each(videos, function (i) {
    $('<a/>', {
      target: '_blank',
      text: videos[i].name,
      href: 'https://www.youtube.com/watch?v=' + videos[i].videoId
    }).appendTo(
      $('<li/>', {
        class: 'list-group-item'
      }).appendTo($('.ytVideos'))
    )
  })
}

function InitEventHandlers () {
  $('#showSC').change(function () {
    showHideField($('.showSC'), this.checked)
    $('.list-group').css({ 'max-height': this.checked ? '235px' : '280px' })
  })
  $('.playlistScraper button').click(scPlaylist)
  $('.userScraper button').click(scUser)
  $('svg').click(function () {
    toggleVideo(
      $(this)
        .attr('class')
        .split('-')[1]
    )
  })
}

function populateSocials () {
  $('.logo').attr('href', socials.youtube)
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
}

function showHideField (field, bool) {
  bool ? field.show() : field.hide()
}
function ytVideos () {
  //Get data from localStorage if already today or from YT videos
  let youtubeVideos =
    (localStorage.timestamp &&
      moment(localStorage.timestamp).isSame(moment(), 'day') &&
      JSON.parse(localStorage.youtubeVideos)) ||
    []
  if (!youtubeVideos.length) {
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
      localStorage.setItem('timestamp', moment().format('YYYY-MM-DD'))
      localStorage.setItem('youtubeVideos', JSON.stringify(youtubeVideos))
    })
  }
  liveStream = youtubeVideos.splice(
    youtubeVideos.findIndex(x => x.name.includes('24/7')),
    1
  )[0]
  youtubeVideos.unshift(liveStream)
  $('.nowPlaying p').text(liveStream.name.split(' - ')[0])
  $('.yt_player_iframe').attr(
    'src',
    'http://www.youtube.com/embed/' +
      liveStream.videoId +
      '?' +
      jQuery.param(videoParams)
  )
  console.log(youtubeVideos)
  return youtubeVideos
}
function scUser () {
  soundcloudData = []
  userURL = $('.userScraper input').val()
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
  console.log(id)
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
  playListURL = $('.playlistScraper input').val()
  $.get(playListURL, function (data, status) {
    soundcloudData = getData(data, 9, 'window.__sc_hydration = ')
    let playlist = getSCDataByKey('playlist')
    console.log(soundcloudData)
    console.log(playlist)
    download(playlist.tracks, playlist.title + '.json')
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
  if (musicButtons[action] == $('.musicStatus p').text()) return
  $('.yt_player_iframe').each(function () {
    this.contentWindow.postMessage(
      '{"event":"command","func":"' + action + 'Video","args":""}',
      '*'
    )
  })
  $('.musicStatus p').text(musicButtons[action])
  showHideField($('.nowPlaying'), action == 'play')
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
