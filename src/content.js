'use strict';

let loaded = false;
let speckle_plus;
let data;

const init_speckle_plus = (event) => {
  const navigation_footer = document.querySelector(
    '.v-navigation-drawer .v-navigation-drawer__append'
  );

  if (navigation_footer) {
    clearInterval(refreshIntervalId);

    console.debug('Found navigation footer');
    speckle_plus = document.createElement('div');
    speckle_plus.classList.add('speckle_plus');
    speckle_plus.id = 'speckle_plus';
    speckle_plus.innerHTML = `Speckle+ Chome extension enables experimental features to the Speckle frontend without requiring development on the base server itself.`;

    navigation_footer.insertAdjacentElement('beforebegin', speckle_plus);
  }
};

var refreshIntervalId = setInterval(init_speckle_plus, 100);

console.log({ chrome });

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name == 'speckle_plus') {
    port.onMessage.addListener(function (msg) {
      var nav = speckle_plus;

      if (!loaded) {
        data = msg;

        var div = document.getElementById('speckle_plus');
        if (div) {
          console.log('speckle_plus already exists');
          div.appendChild(document.createElement('hr'));
          div.appendChild(
            document.createTextNode(
              `Data Tree Loaded: Children Count -> ${JSON.stringify(
                data.totalChildrenCount
              )}`
            )
          );
        }
      }
      loaded = true;
    });
  }
});
