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
