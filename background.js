var soundcloudData = []
var key
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.message === 'scrape' && Url('soundcloud')) {
//   }
// })

$(document).ready(function () {})
function Url (url) {
  return window.location.href.indexOf(url) > 0
}

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
