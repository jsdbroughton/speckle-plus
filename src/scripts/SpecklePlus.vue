<script>
'use strict';

import { defineComponent, ref, onMounted, reactive, toRefs } from 'vue';

export default defineComponent({
  setup() {
    const visible = ref(false);

    const state = reactive({
      currentTab: null,
      loaded: false,
      speckle_plus: undefined,
      data: null
    });

    onMounted(() => {
      chrome.runtime.sendMessage({ type: 'POPUP_INIT' }, async (tab) => {
        state.currentTab = await tab;
      });

      chrome.runtime.onConnect.addListener(function (port) {
        if (port.name == 'speckle_plus') {
          port.onMessage.addListener(function (msg) {
            var nav = state.speckle_plus;
            console.log({ port, state });

            if (!state.loaded) {
              state.data = msg;

              var div = document.getElementById('speckle_plus');
              if (div) {
                console.log('speckle_plus already exists');
              }
            }
            state.loaded = true;
          });
        }
      });
    });

    return {
      visible,
      ...toRefs(state),
    };
  },
});
</script>
<template>
  <div class="overlay" v-show="visible">
    <h1>Speckle+</h1>
    <v-btn size="x-small">Add View</v-btn>
  </div>
</template>