chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request)
  if (request.message == 'get-permalinks') {
    li = $('li.trackList__item')
    links = []
    scUrl = 'https://soundcloud.com'
    replace = '?in=thelofiwifistation/sets/piano-mix'
    li.each(function (i) {
      links.push(
        zeroPad(i + 1, 2) +
          ' - ' +
          scUrl +
          $(this)
            .find('a.trackItem__trackTitle')
            .attr('href')
            .split('?')[0]
      )
    })
    console.log(links.join('\r\n'))
  } else if (request.message == 'download') {
    a = $('div.track-info div.download-tags-div a.track-download')
    console.log(a)
  }
})

$(document).ready(function () {})
function Url (url) {
  return window.location.href.indexOf(url) > 0
}

const zeroPad = (num, places) => String(num).padStart(places, '0')

function Class (className, substr) {
  return className.indexOf(substr) > 0
}

function wait (ms) {
  var start = new Date().getTime()
  var end = start
  while (end < start + ms) {
    end = new Date().getTime()
  }
}
