import ObjectLoader from '@speckle/objectloader';

(function () {
  const tabStorage = {};
  const networkFilters = {
    urls: ['https://*.speckle.dev/graphql', 'https://*.speckle.xyz/graphql'],
  };

  console.log('Speckle+ service worker registered.');

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      const initiator = new URL(details.initiator);
      const url = new URL(details.url);

      if (details.method == 'POST' && details.requestBody) {
        var postedString = decodeURIComponent(
          String.fromCharCode.apply(
            null,
            new Uint8Array(details.requestBody.raw[0].bytes)
          )
        );

        var postedObject = JSON.parse(postedString);

        if (
          postedObject.operationName == 'Object' &&
          initiator.hostname === url.hostname
        ) {
          console.debug({ details, postedObject });

          let loader = new ObjectLoader({
            serverUrl: details.initiator,
            streamId: postedObject.variables.streamId,
            objectId: postedObject.variables.id,
            options: {
              fullyTraverseArrays: false,
              excludeProps: ['displayValue', 'displayMesh', '__closure'],
            },
          });

          let obj = loader.getAndConstructObject();
          obj.then((o) => {
            chrome.tabs.query(
              { active: true, currentWindow: true },
              function (tabs) {
                var port = chrome.tabs.connect(tabs[0].id, {
                  name: 'speckle_plus',
                });
                port.postMessage(o);
              }
            );
          });
        }
      }
    },
    networkFilters,
    ['requestBody', 'extraHeaders']
  );
})();
