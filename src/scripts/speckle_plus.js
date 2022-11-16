import * as THREE from 'three';

let delay = 1000;
let detectRemainingTries = 10;

// namespacing a global is always a good idea
const specklePlus_viewerHandler = {
  startupCoords: [],
  viewer: undefined,
  updateView: function (view) {
    if (!view) {
      this.setView('3d');
    } else {
      this.setView(view);
    }
  },
  setView: function (coords) {
    if (this.viewer) {
      this.viewer.setView({
        position: new THREE.Vector3(coords[0], coords[1], coords[2]),
        target: new THREE.Vector3(coords[3], coords[4], coords[5]),
      });
    }
  },
};

// this in the host page recevies the click event from the Vue UI
window.addEventListener('message', function (detector_msg) {
  if (detector_msg.data && detector_msg.data.setView) {
    // more type confidence than is justified!
    var coords = JSON.parse(detector_msg.data.setView);
    specklePlus_viewerHandler.updateView(coords);
  }
});

// Check for speckle viewer with crude debouncing timeout
function runDetect() {
  // If the web team remove this global it is game over!
  const speckleDetected = !!window._V;

  if (speckleDetected) {
    const viewer = window._V;
    specklePlus_viewerHandler.viewer = viewer;

    // this needs to be better
    specklePlus_viewerHandler.startupCoords = [
      ...Object.values(viewer.cameraHandler.camera.position),
      ...Object.values(viewer.cameraHandler.camera.position),
    ];

    // for anyone who's interested
    window.postMessage({ speckleViewerDetected: true }, '*');
    return;
  }

  if (detectRemainingTries > 0) {
    detectRemainingTries--;
    setTimeout(() => {
      runDetect();
    }, delay);
    delay *= 5;
  }
}

setTimeout(() => {
  runDetect();
}, 100);
