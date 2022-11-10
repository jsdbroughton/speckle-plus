let delay = 1000;
let detectRemainingTries = 10;

function runDetect() {
  // Check for speckle viewer
  const speckleDetected = !!window._V;
  if (speckleDetected) {
    window.postMessage({ speckleDetected: true }, '*');
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
