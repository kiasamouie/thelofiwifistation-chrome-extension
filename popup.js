// chrome.runtime.getBackgroundPage(function (backgroundPage) {
//   console.log(backgroundPage)
// })
const zeroPad = (num, places) => String(num).padStart(places, '0')
$.ajaxSetup({ async: false })
InitDateTime()
var scPlaylistTracks = []
var playlistData = []
var youtubeVideos = []
var souncloudData = []
var musicStatus = 'Playing...'
var liveStream
var nowPlaying = ''
var playListURL = ''
var userURL = ''
var socials = {
  youtube: 'https://www.youtube.com/c/THELOFIWIFISTATION',
  soundcloud: 'https://soundcloud.com/thelofiwifistation',
  spotify: 'https://open.spotify.com/playlist/7AbkW3uVMBclLgt7dG7jS2',
  instagram: 'https://www.instagram.com/thelofiwifistation',
  twitter: 'https://twitter.com/LofiWifiStation'
}
var youtube_content = {}
var youtube_urls = {
  "1": 'videos',
  "2": 'shorts',
  "3": 'streams',
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

var client_id
var app_version
var app_locale

$.getJSON('config.json', function (json) {
  client_id = json.client_id
  app_version = json.app_version
  app_locale = json.app_locale
})

console.log(client_id)
var soundcloudUserId

function InitDateTime() {
  var interval = setInterval(function () {
    var now = moment()
    $('#date').html(now.format('dddd, MMMM Do YYYY '))
    $('#time').html(now.format('HH:mm:ss A'))
  }, 100)
}

$(document).ready(function () {
  get_youtube_content()
  console.log(youtube_content)
  populate_youtube_content()
  check_tabs_for_watch_url()
  init_event_handlers()
  populate_socials()
  $('.musicStatus').text(musicStatus)
})


function get_youtube_content() {
  youtube_content = (localStorage.timestamp && moment(localStorage.timestamp).isSame(moment(), 'day') && JSON.parse(localStorage.youtube_content)) || {}
  if (!Object.keys(youtube_content).length) {
    $.each(youtube_urls, function (action_tab, action) {
      $.get(socials.youtube + `/${action}`, function (data, status) {
        var contents = getData(data, 'var ytInitialData = ').contents.twoColumnBrowseResultsRenderer.tabs[action_tab].tabRenderer.content.richGridRenderer.contents
        youtube_content[youtube_urls[action_tab]] = $.map(contents, function (v) {
          let content = v.richItemRenderer.content
          return {
            name: content.hasOwnProperty('videoRenderer') ? content.videoRenderer.title.runs[0].text : content.reelItemRenderer.headline.simpleText,
            videoId: content.hasOwnProperty('videoRenderer') ? content.videoRenderer.videoId : content.reelItemRenderer.videoId
          }
        })
      })
    })
    localStorage.setItem('timestamp', moment().format('YYYY-MM-DD'))
    localStorage.setItem('youtube_content', JSON.stringify(youtube_content))
  }
  liveStream = youtube_content.streams[0]
  $('.nowPlaying').text(liveStream.name.split(' | ')[0])
  $('.yt_player_iframe').attr('src', `http://www.youtube.com/embed/${liveStream.videoId}?${jQuery.param(videoParams)}`)
}

function populate_youtube_content() {
  $.each(youtube_content, function (type) {
    content = youtube_content[type]
    url_action = type != 'shorts' ? 'watch?v=' : 'shorts/'
    $.each(content, function (i, video) {
      $('<a/>', {
        target: '_blank',
        text: video.name,
        href: `https://www.youtube.com/${url_action}${video.videoId}`
      }).appendTo(
        $('<li/>', {
          class: 'list-group-item'
        }).appendTo($(`#${type} ul`))
      )
    })
  })
}

function check_tabs_for_watch_url() {
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

function init_event_handlers() {
  $('#reset').change(function () {
    this.checked && reset()
    window.location.reload(true)
  })
  $('.fa').click(function () {
    toggleVideo($(this).attr('class').split('-')[1])
  })
}

function populate_socials() {
  $('.logo').attr('href', `${socials.youtube}/videos`)
  $('.socials a').each(function () {
    $(this).attr('href', socials[$(this).attr('class').split('-')[1]])
  })
}

function toggleVideo(action) {
  let currentAction = getKeyByValue(musicButtons, $('.musicStatus').text().replace('...', ''))
  if (musicButtons[action] == $('.musicStatus').text() || (action == 'pause' && currentAction == 'stop')) return
  $('.yt_player_iframe').each(function () {
    this.contentWindow.postMessage('{"event":"command","func":"' + action + 'Video","args":""}', '*')
  })
  $('.musicStatus').text(musicButtons[action] + '...')
  showHideField($('.nowPlaying'), action == 'play')
}

function Class(className, substr) {
  return className.indexOf(substr) > 0
}

function showHideField(field, bool) {
  bool ? field.show() : field.hide()
}

function permalinks() {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    var activeTab = $.grep(tabs, function (tab) {
      return tab.active
    })[0]
    chrome.tabs.sendMessage(activeTab.id, {
      message: 'get-permalinks'
    })
  })
}
function reset() {
  console.log(localStorage)
  localStorage.clear()
  console.log(localStorage)
}

function scUser() {
  soundcloudData = []
  userURL = $('.userScraper input').val()
  $.get(userURL, function (data, status) {
    soundcloudData = getData(data, 'window.__sc_hydration = ')
    console.log(soundcloudData)
    let user = getSCDataByKey('user')
    soundcloudUserId = user.id
    let tracks = scUserTracks(user)
    console.log(tracks)
    download(tracks, user.permalink + ' - tracks.json')
  })
}
function scUserTracks(user) {
  console.log(user)
  let limit = $('.userLastTracks .limit')
  let id = $('.userLastTracks .id')
  soundcloudUserId = user.id
  id.val(soundcloudUserId)
  id.removeAttr('disabled')
  limit.removeAttr('disabled')
  return $.get(
    'https://api-v2.soundcloud.com/users/' +
    user.id +
    '/tracks?representation=&client_id=' +
    client_id +
    '&app_version=' +
    app_version +
    '&app_locale=' +
    app_locale,
    function (res, status) {
      return res
    }
  ).responseJSON.collection
}
function scPlaylist() {
  soundcloudData = []
  playListURL = $('.playlistScraper input').val()
  $.get(playListURL, function (data, status) {
    soundcloudData = getData(data, 'window.__sc_hydration = ')
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
    download(playlistData, playlist.title + '.json')
    playlistData = []
  })
}
function scrapeScPlaylistTracks(ids) {
  console.log(ids)
  let links = []
  $.get(
    'https://api-v2.soundcloud.com/tracks?ids=' +
    ids +
    '&client_id=' +
    client_id +
    '&app_version=' +
    app_version +
    '&app_locale=' +
    app_locale,
    function (res, status) {
      $.each(res, function (i, playlist) {
        // links.push(zeroPad(i + 1, 2) +' - '+ playlist.id)
        links.push(zeroPad(playlist.id))
      })
      playlistData = merge(playlistData, links)
      console.log(links)
    }
  )
}
function scUserLastTracks() {
  limit = 10
  console.log(
    'https://api-v2.soundcloud.com/stream/users/' +
    soundcloudUserId +
    '?offset=2021-03-19T23:15:18.000Z,tracks,01011515467&limit=' +
    limit +
    '&client_id=' +
    client_id +
    '&app_version=' +
    app_version +
    '&app_locale=' +
    app_locale
  )
  if (!soundcloudUserId) {
    alert('No SoundCloud ID')
    return
  }
  $.get(
    'https://api-v2.soundcloud.com/stream/users/' +
    soundcloudUserId +
    '?offset=2021-03-19T23:15:18.000Z,tracks,01011515467&limit=' +
    limit +
    '&client_id=' +
    client_id +
    '&app_version=' +
    app_version +
    '&app_locale=' +
    app_locale,
    function (res, status) {
      console.log(res)
    }
  )
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value)
}

function download(data, fileName) {
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

function createDom(data) {
  const parser = new DOMParser()
  return parser.parseFromString(data, 'text/html')
}

function getData(data, string) {
  // console.log(string)
  // console.log($(createDom(data))[0].scripts)
  index = $.map($(createDom(data))[0].scripts, function (script, i) {
    if (script.innerText.includes(string)) return i
  })[0]
  // console.log(index)
  console.log(JSON.parse(
    $(createDom(data))[0]
      .scripts[index].innerText.slice(0, -1)
      .replace(string, '')
  ))
  return JSON.parse(
    $(createDom(data))[0]
      .scripts[index].innerText.slice(0, -1)
      .replace(string, '')
  )
}

function getSCDataByKey(key) {
  return $.grep(soundcloudData, function (v, i) {
    return v.hydratable === key
  })[0].data
}

function chunk(array, size) {
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
