var soundcloudData = []
var key
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'scrape' && Url('soundcloud')) {
  }
})

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

// chrome.runtime.sendMessage({
//     msg: "something_completed",
//     data: {
//         subject: "Loading",
//         content: "Just completed!"
//     }
// });
// $.ajaxSetup({ async: true })

// function Whatsapp () {
//   var whatsapp = $('._1XkO3')
//   if (whatsapp.length) {
//     whatsapp.attr('id', 'main')
//     PushCustomCss('whatsapp')
//   }
//   return whatsapp.length > 0
// }

// function Interval (secs) {
//   var i = setInterval(function () {
//     clearInterval(i)
//   }, secs)
// }

// function PushCustomCss (website) {
//   var path = chrome.extension.getURL(website + '.css')
//   $('head').append(
//     $('<link>')
//       .attr('rel', 'stylesheet')
//       .attr('type', 'text/css')
//       .attr('href', path)
//   )
// }

// function Events (website) {
//   $(document).keyup(function (e) {
//     if (
//       website == 'whatsapp' &&
//       e.ctrlKey &&
//       $.inArray(66, [e.keyCode, e.which]) !== -1
//     ) {
//       $('._3yWey').addClass('XKmj6')
//       $('._1UWac').addClass('focused')
//       $('._13NKt').focus()
//     }
//   })
// }

// Events(website)
