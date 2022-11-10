window.addEventListener('message', (e) => {
  if (e.source === window && e.data.speckleDetected) {
    chrome.runtime.sendMessage(e.data);
  }
});

var s = document.createElement('script');
s.src = chrome.runtime.getURL('/scripts/detector.js');

s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
