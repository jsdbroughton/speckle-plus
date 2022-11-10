import ObjectLoader from '@speckle/objectloader';

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on example.com pages
    let speckleRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: '.speckle.xyz' },
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: '.speckle.dev' },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    };

    // Finally, apply our new array of rules
    let rules = [speckleRule];
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { toggleVisible: true });
  }
});

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'POPUP_INIT':
      getCurrentTab().then(sendResponse);
      return true;
    default:
      break;
  }
});

// (function () {
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
              var activeTab = tabs[0];
              if (activeTab) {
                var port = chrome.tabs.connect(activeTab.id, {
                  name: 'speckle_plus',
                });
                port.postMessage(o);
              }
            }
          );
        });
      }
    }
  },
  networkFilters,
  ['requestBody', 'extraHeaders']
);
// })();
