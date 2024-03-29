$.ajaxSetup({ async: false })

var socials = {
  youtube: 'https://www.youtube.com/c/THELOFIWIFISTATION',
  soundcloud: 'https://soundcloud.com/thelofiwifistation',
  tiktok: 'https://www.tiktok.com/@thelofiwifistation',
  instagram: 'https://www.instagram.com/thelofiwifistation',
  spotify: 'https://open.spotify.com/playlist/7AbkW3uVMBclLgt7dG7jS2',
  twitter: 'https://twitter.com/LofiWifiStation'
}
var live_stream = null
var youtube_content = {}
var youtube_urls = {
  "1": 'videos',
  "2": 'shorts',
  "3": 'streams',
}
var now_playing_buttons = {
  stop: 'Stopped',
  play: 'Playing',
  pause: 'Paused'
}
var videoParams = {
  autoplay: 1,
  enablejsapi: 1,
  version: 3,
  playerapiid: 'ytplayer'
}
var now_playing_video = 0
var interval = setInterval(function () {
  var now = moment()
  $('#date').html(now.format('dddd, MMMM Do YYYY '))
  $('#time').html(now.format('HH:mm:ss A'))
}, 100)

$(document).ready(function () {
  populate_socials()
  get_youtube_content()
  populate_youtube_content()
  init_event_handlers()
  check_tabs_for_watch_url()
})

function parse_html_response(data, string) {
  const parser = new DOMParser()
  let scripts = $(parser.parseFromString(data, 'text/html'))[0].scripts
  let index = $.map(scripts, (script, i) => { if (script.innerText.includes(string)) return i })
  let json = JSON.parse(scripts[index].innerText.slice(0, -1).replace(string, ''))
  console.log(json)
  return json
}

function get_youtube_content() {
  youtube_content = (localStorage.timestamp && moment(localStorage.timestamp).isSame(moment(), 'day') && JSON.parse(localStorage.youtube_content)) || {}
  if (!Object.keys(youtube_content).length) {
    $.each(youtube_urls, function (action_tab, action) {
      $.get(socials.youtube + `/${action}`, function (data, status) {
        let html = parse_html_response(data, 'var ytInitialData = ')
        if (!html.contents.twoColumnBrowseResultsRenderer.tabs[action_tab].tabRenderer.content.richGridRenderer) return 
        var contents = html.contents.twoColumnBrowseResultsRenderer.tabs[action_tab].tabRenderer.content.richGridRenderer.contents
        youtube_content[action] = $.map(contents, function (v, i) {
          if (!v.richItemRenderer) return
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
  console.log(youtube_content)
  let stream_status = 'Stream Unavailable'
  if(youtube_content.hasOwnProperty('streams')){
    live_stream = youtube_content.streams
    stream_status = now_playing_buttons['play']
  }
  update_stream_status(stream_status)
  init_live_stream()
}

function create_tabs_content() {
  $.each(youtube_content, function (type) {
    let active = type == 'videos' ? ' active' : ''
    // nav
    $('<a/>', {
      class: `nav-link${active}`,
      'data-bs-toggle': 'tab',
      href: `#${type}`,
      text: type.capitalize()
    }).appendTo(
      $('<li/>', {
        class: 'nav-item'
      }).appendTo($('.youtube-content ul.nav'))
    )
    // content
    $('<ul/>', {
      class: 'list-group shadow-lg',
    }).appendTo(
      $('<div/>', {
        class: `tab-pane fade show${active}`,
        id: type,
      }).appendTo($('.youtube-content div.tab-content'))
    )
  })
}

function populate_youtube_content() {
  create_tabs_content()
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
      if (v.url.includes('/watch') || v.url.includes('/shorts')) {
        var i = setInterval(function () {
          toggle_video('stop')
          clearInterval(i)
        }, 500)
      }
    })
  })
}

function init_event_handlers() {
  $('#reset').change(function () {
    this.checked && localStorage.clear()
    window.location.reload(true)
  })
  $('.fa').click(function () {
    let _class = $(this).attr('class')
    toggle_video(_class.slice(_class.lastIndexOf('-')+1,_class.length))
  })
}

function populate_socials() {
  $('.logo').attr('href', `${socials.youtube}/videos`)
  $('.socials a').each(function () {
    $(this).attr('href', socials[$(this).attr('class').split('-')[1]])
  })
}

function get_key_by_value(object, value) {
  return Object.keys(object).find(key => object[key] === value)
}

function toggle_video(action) {
  let currentAction = get_key_by_value(now_playing_buttons, $('.stream-status').text().replace('...', ''))
  if (now_playing_buttons[action] == $('.stream-status').text() || (action == 'pause' && currentAction == 'stop') ||  $.inArray(action,['prev','next']) !== -1 || !live_stream) return
  $('.yt_player_iframe').each(function () {
    this.contentWindow.postMessage(`{"event":"command","func":"${action}Video","args":""}`, '*')
  })
  update_stream_status(now_playing_buttons[action])
}

function init_live_stream(){
  if (!live_stream) return
  let stream = live_stream[0]
  $('.now-playing').text(stream.name.split(' | ')[1])
  $('.yt_player_iframe').attr('src', `http://www.youtube.com/embed/${stream.videoId}?${jQuery.param(videoParams)}`)
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

function update_stream_status(stream_status) {
  $('.stream-status').text(`${stream_status}...`)
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}