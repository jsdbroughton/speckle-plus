// This script is attached to the on_document_idle event at page load
// this property is defined in the manifest

// Chrome extension content scripts (the Vue UI) have no access to the host
// page window global properties, only the DOM
// So we inject scripts to the host that will be able to do so.
// We have to pass messages as strings back and forth.
var scriptNode = document.createElement('script');
scriptNode.src = chrome.runtime.getURL('/scripts/speckle_plus.js');

// This helper script doesn't need to hang about.
scriptNode.onload = function () {
  this.remove();
};

// Inject It!
(document.head || document.documentElement).appendChild(scriptNode);

// Listens for the injected script confirmation it has found a Viewer object
window.addEventListener('message', (e) => {
  if (e.source === window && e.data.speckleDetected) {
    chrome.runtime.sendMessage(e.data);
  }
});
