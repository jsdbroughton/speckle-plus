import { createApp } from 'vue';
import SpecklePlus from './SpecklePlus.vue';
import '@/styles/speckle.css';

// UI layout container
const SPECKLE_PLUS = 'speckle-plus';
let specklePlusLayout = document.getElementById(SPECKLE_PLUS);
if (specklePlusLayout) {
  specklePlusLayout.innerHTML = '';
}
specklePlusLayout = document.createElement('div');
specklePlusLayout.setAttribute('id', SPECKLE_PLUS);
document.body.append(specklePlusLayout);

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
});

const vm = createApp(SpecklePlus).use(vuetify).mount(specklePlusLayout);

chrome.runtime.onMessage.addListener((message) => {
  if (message.toggleVisible && vm) {
    vm.visible = !vm?.visible;
  }
});
