import { createApp } from 'vue';
import Speckle from './SpecklePlus.vue';
import '@/styles/speckle.css';

const SPECKLE_PLUS = 'speckle-plus';

let specklePlus = document.getElementById(SPECKLE_PLUS);
if (specklePlus) {
  specklePlus.innerHTML = '';
}
specklePlus = document.createElement('div');
specklePlus.setAttribute('id', SPECKLE_PLUS);

document.body.append(specklePlus);

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
});

const vm = createApp(Speckle).use(vuetify).mount(specklePlus);

chrome.runtime.onMessage.addListener((message) => {
  if (message.toggleVisible && vm) {
    vm.visible = !vm?.visible;
  }
});
