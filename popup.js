function ScrapePlaylistData () {
  // chrome.tabs.query({ currentWindow: true, active: true }, function (
  //   tabs
  // ) {
  //   var activeTab = $.grep(tabs, function (tab) {
  //     return tab.active
  //   })[0]
  //   console.log(chrome)
  //   chrome.tabs.sendMessage(tabs[0].id, {
  //     message: 'scrape'
  //   })
  // })
  // chrome.tabs.query({currentWindow: true}, function (tabs){
  //     var activeTab = $.grep(tabs, function(tab){ return tab.active })[0];
  //     chrome.tabs.sendMessage(activeTab.id, {"message": "check-background", "tabs": tabs});
  // 	if(tabs.length >= 3){
  //     }
  // });
  // chrome.history.search({text: ''}, function(history) {
  //     history.forEach(function(page) {
  //         console.log(page.url);
  //     });
  // });
  // chrome.runtime.onMessage.addListener(
  //     function(request, sender, sendResponse) {
  //         if (request.msg === "something_completed") {
  //             //  To do something
  //         }
  //     }
  // );
  // chrome.runtime.onMessage.addListener(function(request, sender) {
  // 	if (request.type == "function-from-backend"){
  //     }
  // });
  // var variable
  // $.getJSON('.json', function (json) {
  //   variable = json
  // })
  // function getData () {
  //   $.each(array, function (k, t) {})
  // }
  // data = responseJSON.users
  // const a = document.createElement('a')
  // a.href = URL.createObjectURL(
  //   new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' })
  // )
  // a.setAttribute('download', 'followers.json')
  // document.body.appendChild(a)
  // a.click()
  // document.body.removeChild(a)
  // function clearLocalStroage () {
  //   localStorage.clear()
  // }
  // const functions = new Proxy(
  //   { getData, clearLocalStroage, exportFollowers2json },
  //   {
  //     get () {
  //       console.clear()
  //       return Reflect.get(...arguments)
  //     }
  //   }
  // )
  // var codes = [
  //   { code: keyCodes.c, func: null },
  //   { code: keyCodes.s, func: null }
  // ]
  // var buttons = [
  //   {
  //     id: 'followers',
  //     func: null,
  //     value: 0,
  //     pos: 'left'
  //   },
  //   { id: 'clear', func: null, value: 0, pos: 'right' }
  // ]
  // function createHeader () {
  //   $.each(buttons, function (i, b) {
  //     $('.header').after(
  //       $('<div/>', { class: 'pull-' + b.pos + ' ' + b.id }).append(
  //       )
  //     )
  //   })
  // }
  // $(document).keyup(function (e) {
  //   if (e.altKey) {
  //     $.each(codes, function (i, c) {
  //       if ($.inArray(c.code, [e.keyCode, e.which]) !== -1) c.func()
  //     })
  //   }
  // })
}

// chrome.runtime.getBackgroundPage(function (backgroundPage) {
//   console.log(backgroundPage)
// })

$.ajaxSetup({ async: false })
var today = moment().format('DD/MM/YYYY')
var scPlaylistTracks = []

$(document).ready(function () {
  vm = new Vue({
    el: '#app',
    data: {
      edit: true,
      musicStatus: 'Playing',
      nowPlaying: null,
      playListURL:
        'https://soundcloud.com/sebastian-lopez-49626625/sets/lofi-remixes',
      userURL: 'https://soundcloud.com/thekiadoe',
      ytVideosURL: 'https://www.youtube.com/c/THELOFIWIFISTATION/videos',
      socials: {
        youtube: 'https://www.youtube.com/c/THELOFIWIFISTATION',
        soundcloud: 'https://soundcloud.com/thelofiwifistation',
        spotify: 'https://open.spotify.com/playlist/7AbkW3uVMBclLgt7dG7jS2',
        instagram: 'https://www.instagram.com/thelofiwifistation',
        twitter: 'https://twitter.com/LofiWifiStation'
      },
      youtubeVideos: [],
      souncloudData: [],
      musicButtons: [
        { action: 'stop', status: 'Stopped' },
        { action: 'play', status: 'Playing' },
        { action: 'pause', status: 'Paused' }
      ]
    },
    methods: {
      myTracks: function () {
        $.get(
          'https://api-v2.soundcloud.com/users/66593390/tracks?representation=&client_id=sqBVzKo4j9IoDkrB4lo2LJsSmZtfmUp5&limit=20&offset=0&linked_partitioning=1&app_version=1643299901&app_locale=en',
          function (res, status) {
            console.log(res.collection)
          }
        )
      },
      ytVideos: function (url) {
        $.get(vm.ytVideosURL, function (data, status) {
          let youtubeVideos = $.map(
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
          vm.nowPlaying = liveStream.name.split(' - ')[0]
          youtubeVideos.unshift(liveStream)
          vm.youtubeVideos = youtubeVideos
        })
      },
      scUser: function (url) {
        vm.soundcloudData = []
        $.get(vm.userURL, function (data, status) {
          vm.soundcloudData = getData(data, 9, 'window.__sc_hydration = ')
          console.log(vm.soundcloudData)
          let user = getSCDataByKey('user', vm)
          let tracks = vm.scUserTracks(user.id)
          console.log(tracks)
          download(tracks, user.permalink + ' - tracks.json')
        })
      },
      scUserTracks: function (id) {
        // console.log(id)
        return $.get(
          'https://api-v2.soundcloud.com/users/' +
            id +
            '/tracks?representation=&client_id=sqBVzKo4j9IoDkrB4lo2LJsSmZtfmUp5&limit=20&offset=0&linked_partitioning=1&app_version=1643299901&app_locale=en',
          function (res, status) {
            return res
          }
        ).responseJSON.collection
      },
      scPlaylist: function (url) {
        vm.soundcloudData = []
        $.get(vm.playListURL, function (data, status) {
          vm.soundcloudData = getData(data, 9, 'window.__sc_hydration = ')
          console.log(vm.soundcloudData)
          let playlist = getSCDataByKey('playlist', vm)
          console.log(playlist)
          $.each(
            chunk(
              $.map(playlist.tracks, function (v, i) {
                return v.id
              }),
              24
            ),
            function (i, ids) {
              vm.scPlaylistTracks(encodeURIComponent(ids))
            }
          )
          download(scPlaylistTracks, playlist.title + '.json')
        })
      },
      scPlaylistTracks: function (ids) {
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
      },
      toggleVideo: function (action) {
        $('.yt_player_iframe').each(function () {
          this.contentWindow.postMessage(
            '{"event":"command","func":"' + action + 'Video","args":""}',
            '*'
          )
        })
        this.musicStatus = $.grep(this.musicButtons, function (v, i) {
          return v.action === action
        })[0].status
      }
    },
    computed: {
      invoiceDateParsed () {
        return moment(this.invoiceDate).format('DD/MM/YYYY')
      }
    }
  })
  vm.ytVideos()
  console.log(vm)
})

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

function getSCDataByKey (key, vm) {
  return $.grep(vm.soundcloudData, function (v, i) {
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
