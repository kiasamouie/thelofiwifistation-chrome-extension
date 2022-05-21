// chrome.runtime.getBackgroundPage(function (backgroundPage) {
//   console.log(backgroundPage)
// })
$.ajaxSetup({ async: false })
InitDateTime()
var scPlaylistTracks = []
var youtubeVideos = []
var souncloudData = []
var musicStatus = 'Playing...'
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
var client_id = 'xJmsHs37dLKGnKYrWkjl2xQYMEtUp1nz'
var app_version = '1652769205'
var app_locale = 'en'

var names = [
  'Frook ',
  'Jhfly ',
  'Don c',
  'Idealism',
  'Guru griff',
  'Flughand ',
  'Glimlip',
  'Bido',
  'Ahwlee',
  'Axian',
  'Sleepy fish',
  'Gyvus ',
  'Saito',
  'Gonza',
  'Alex',
  'Maoen',
  'Jinsang',
  'philanthrope',
  'Dusty decks',
  'Henyao',
  'Silo',
  'Voyage',
  'Kendall Miles',
  "J'san",
  'Dlj',
  'Camro',
  'Otis ubaka',
  'Emapea',
  'Samwisee',
  'Johto',
  "I'll flottante",
  "L'indecis",
  'Ak420',
  'Purple cat',
  'T stratt',
  'Harris Cole',
  'Lucid',
  'hm surf',
  'Ginji ',
  'Rookie',
  'Elijah nang',
  'Joey pecoraco',
  'Saib',
  'Soho',
  'Domo',
  'Apo',
  'Mommy',
  'Downtown owl',
  'Potsu',
  'Twuan',
  'Sky high',
  'Delayde',
  'Miraa',
  'Flamingosis',
  'Garba9',
  'A3le',
  'Leavv',
  'knowmadic',
  'Digitaluc',
  '90sflav',
  'Chief',
  'Huey daze',
  'Flofilz',
  'Moow',
  'Mago',
  'Gentlebeatz',
  'Headphone activist',
  'Akuma',
  'Ajmw',
  'Eaup',
  'yestalgia',
  'Mt fujitive',
  'Warm keys',
  'Globulhub',
  'Loop holes, loop fattig',
  'Toj',
  'Toonorth',
  'Saito and Lester ',
  'Muralee',
  'Joe cornfield',
  'Momma',
  'Matt quentin',
  'Elijah who',
  'Guustavv',
  'Medda',
  'Aso',
  'the deli',
  'muralee',
  'miscel',
  'Only ',
  'creative self',
  'nom tunes',
  'lost son',
  'mago',
  'Marion Knight ',
  'Wun 4 dilla - saiko',
  'spaze windu',
  'Sad boy with a laptop',
  'Burbank',
  'Camro',
  'Jordy chandra',
  'Leaf beach',
  'Aimless',
  'Soulou',
  'Leaf beach',
  'Tusken',
  'Caleb belkin',
  'Soullue',
  'Justice der',
  'A(way)',
  'Zmeyev',
  'No sugar no calories;sleepermane',
  'Mila coolness',
  'Astroblk',
  'Kayou',
  'Ai means love',
  'Aphrow',
  'Moonandco',
  'Edmnd/kap ',
  'Ridrohules',
  'Koralle',
  'Niquo',
  'Konteks',
  'Melodiesinfonie',
  'Yeyts',
  'Tesk',
  'Sitting duck',
  'Deauxnuts',
  'twotrees',
  'No spirit',
  'Kevoe West',
  'Aftrthgt',
  'Didi crazz',
  'Mum child',
  'Lofi luke',
  'Augi wa',
  'Mt marcy',
  'Barradeen ',
  'Ddob ',
  'Joan of arc',
  'Minihaze',
  'Oofoe',
  'Lonesome flatpicker'
]

$(document).ready(function () {
  videos = ytVideos()
  populateYoutubeVideos()
  checkYoutubeWatchUrl()
  InitEventHandlers()
  populateSocials()
  $('.musicStatus').text(musicStatus)
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
    $('.list-group').css({ 'max-height': this.checked ? '254px' : '280px' })
  })
  $('.playlistScraper button').click(scPlaylist)
  $('.userScraper button').click(scUser)
  $('.ytDescription button').click(ytDescription)
  $('.search button').click(search)
  $('.fa').click(function () {
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
  //Get data from localStorage if today or from YT videos
  let youtubeVideos =
    (localStorage.timestamp &&
      moment(localStorage.timestamp).isSame(moment(), 'day') &&
      JSON.parse(localStorage.youtubeVideos)) ||
    []
  if (!youtubeVideos.length) {
    console.log(
      $.get(ytVideosURL, function (data, status) {
        youtubeVideos = $.map(
          getData(data, 33, 'var ytInitialData = ').contents
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
    )
  }
  liveStream = youtubeVideos.splice(
    youtubeVideos.findIndex(x => x.name.includes('24/7')),
    1
  )[0]
  youtubeVideos.unshift(liveStream)
  $('.nowPlaying').text(liveStream.name.split(' - ')[0])
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
var soundcloudSearchResults = []
function searchSoundcloud (query) {
  return $.get(
    'https://api-v2.soundcloud.com/search?q=' +
      encodeURIComponent(query) +
      '&sc_a_id=7394189d02c68695a67c67ca6b58135d849a187f&variant_ids=&facet=model&user_id=545777-543470-899163-553282&client_id=' +
      client_id +
      '&app_version=' +
      app_version +
      '&app_locale=' +
      app_locale,
    function (res, status) {
      let url = res.collection[0] && res.collection[0].permalink_url
      console.log(query + ' - ' + (url || "Didn't find"))
      soundcloudSearchResults.push(query + ' - ' + (url || "Didn't find"))
    }
  )
}

function search () {
  $.each(names, function (i, name) {
    searchSoundcloud(encodeURIComponent(name))
  })
  download(soundcloudSearchResults, 'SoundcloudSearch.json')
  soundcloudSearchResults = []
}
function ytDescription () {
  ytDescriptionURL = $('.ytDescription input').val()
  $.get(ytDescriptionURL, function (data, status) {
    data = getData(data, 39, 'var ytInitialData = ')
    console.log(data)
    // download(tracks, user.permalink + ' - tracks.json')
  })
}
function scUser () {
  soundcloudData = []
  userURL = $('.userScraper input').val()
  $.get(userURL, function (data, status) {
    soundcloudData = getData(data, 10, 'window.__sc_hydration = ')
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
function scPlaylist () {
  soundcloudData = []
  playListURL = $('.playlistScraper input').val()
  $.get(playListURL, function (data, status) {
    soundcloudData = getData(data, 10, 'window.__sc_hydration = ')
    let playlist = getSCDataByKey('playlist')
    console.log(soundcloudData)
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
    scPlaylistTracks = []
  })
}
function scrapeScPlaylistTracks (ids) {
  console.log(ids)
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
      scPlaylistTracks = merge(scPlaylistTracks, res)
      console.log(scPlaylistTracks)
    }
  )
}
function toggleVideo (action) {
  let currentAction = getKeyByValue(
    musicButtons,
    $('.musicStatus')
      .text()
      .replace('...', '')
  )
  if (
    musicButtons[action] == $('.musicStatus').text() ||
    (action == 'pause' && currentAction == 'stop')
  )
    return
  $('.yt_player_iframe').each(function () {
    this.contentWindow.postMessage(
      '{"event":"command","func":"' + action + 'Video","args":""}',
      '*'
    )
  })
  $('.musicStatus').text(musicButtons[action] + '...')
  showHideField($('.nowPlaying'), action == 'play')
}

function getKeyByValue (object, value) {
  return Object.keys(object).find(key => object[key] === value)
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
  // console.log(string)
  // console.log(index)
  // console.log($(createDom(data))[0].scripts)
  // return
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
