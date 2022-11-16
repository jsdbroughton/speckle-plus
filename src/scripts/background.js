import ObjectLoader from '@speckle/objectloader';

console.log('Speckle+ service worker registered.');

// This fires way before any page content loads
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();

  // Clear all rules for testing valid sites for SpecklePlus
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on speckle sites (hardcoded so far)
    let speckleRule = {
      conditions: [
        // The OG XYZ
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: '.speckle.xyz' },
        }),
        // Life at the Bleeding Edge
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: '.speckle.dev' },
        }),
      ],
      // ShowAction actually means MakeActive - dont @ me
      actions: [new chrome.declarativeContent.ShowAction()],
    };

    // Finally, apply our new array of rules
    let rules = [speckleRule];
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});

// Clicking the icon makes the Speckle Plus UI visible
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { toggleVisible: true });
  }
});

// helper function around the verbose method to get the active tab
// there is an alternative where you pass null to the query, but only
// seems to work where we don't apply validity rules
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Scaffold to receive messages from the frontend UI
// message object should carry a 'type' property
chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  switch (message.type) {
    // Initialize communication between frontend and backend worker.
    case 'SPECKLE_INIT':
      getCurrentTab().then(sendResponse);
      return true;

    default:
      break;
  }
  // leave dangling as a Promise or return true to complete the contract
  return true;
});

// unused but might be better to fish around in localStorage than hijack
// the query and repeat it
const tabStorage = {};

/**
 * webRequest permissions granted in the manifest
 * placholder for now to later handle the object
 * this piggybacks the graphql query and intercepts the details
 */
const validQueryTargetFilter = {
  urls: ['https://*.speckle.dev/graphql', 'https://*.speckle.xyz/graphql'],
};
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
        // All the details in the Speckle Frontend query
        // replicated here with a separate ObjectLoader instance.
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

        // This posts the loaded object list and punts it to the frontend
        obj.then((o) => {
          // TODO: refactor the helper function to accept a callback.
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              var activeTab = tabs[0];
              if (activeTab) {
                var port = chrome.tabs.connect(activeTab.id, {
                  name: 'speckle_plus',
                });
                console.log({ o });
                port.postMessage(o);
              }
            }
          );
        });
      }
    }

    return true;
  },
  validQueryTargetFilter,
  // belt and braces until full scope needs are known
  ['requestBody', 'extraHeaders']
);
