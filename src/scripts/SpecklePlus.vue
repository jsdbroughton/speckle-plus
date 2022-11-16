<script>
'use strict';

import { defineComponent, ref, onMounted, reactive, toRefs } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import draggable from 'vuedraggable'

export default defineComponent({
  setup() {
    // default state is hidden - ref changes on chrome icon click
    const visible = ref(false);

    const state = reactive({
      currentTab: null,
      loaded: false,
      objectData: null
    });

    onMounted(() => {
      // Using the Vue component mount to represent the extension load event
      chrome.runtime.sendMessage({ type: 'SPECKLE_INIT' }, async (tab) => {
        state.currentTab = await tab;
      });

      // Frontend backend messaging is more flexible than you get with
      // window.PostMessage events.
      // the callback on this is a bit clunky.
      // Intention is to have all the moving parts at rest on load before 
      // enabling interactions
      chrome.runtime.onConnect.addListener(function (port) {
        if (port.name == 'speckle_plus') {
          port.onMessage.addListener(function (msg) {
            if (!state.loaded) {
              state.objectData = msg;
            }
            state.loaded = true;
          });
        }
      });
    });

    return {
      visible,
      objectData: state.objectData,
      ...toRefs(state),
    };
  },
  components: { draggable },
  data() {
    return {
      // You'll love how minimal this app is!
      views: [],
      activeView: 0,
      activeGuid: null
    }
  },
  methods: {
    addView() {
      // Grab the current window URL
      // This isn't great as there is a lag between making changes in the 
      // Frontend and it being reflected in the URL!
      // But it saves a round trip to the injected script to scrape the viewer
      // from global
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const coords = params.get('c');

      if (coords) {
        // its all to easy to press save before the url is updated!
        if (this.views.length <= 0 || !this.views.slice(-1) || this.views.slice(-1)[0] && this.views.slice(-1)[0].coords !== coords) {
          this.views.push({ coords, guid: uuidv4() }
          )
        }
      }

      this.activeView = this.views.length - 1;
    },
    setView(coords, index) {
      // send the "instruction" to the injected script
      window.postMessage({ setView: coords }, '*')
      this.activeView = index;
      this.activeGuid = this.views[this.activeView];
    },
    deleteView(guid, index) {
      if (guid !== this.activeGuid) {
        const viewIndex = this.views.findIndex(v => { v.guid === guid })
        this.views.splice(viewIndex, 1)
        this.activeView = this.views.length;
        return;
      }

      this.activeView = this.views.findIndex(v => v.guid === this.activeGuid);
    },
    prevView() {
      if (this.views.length <= 0) { return; }
      const destinationIndex = this.activeView === 0 ? this.views.length - 1 : this.activeView - 1;
      this.setView(this.views[destinationIndex].coords, destinationIndex);
    },
    nextView() {
      if (this.views.length <= 0) { return; }
      const destinationIndex = this.activeView === this.views.length - 1 ? 0 : this.activeView + 1;
      this.setView(this.views[destinationIndex].coords, destinationIndex);
    },
    onStart() {
      this.activeGuid = this.views[this.activeView] && this.views[this.activeView].guid;
    },
    onEnd() {
      this.activeView = this.views.findIndex(v => v.guid === this.activeGuid);
      if (this.views[this.activeView]) {
        this.setView(this.views[this.activeView].coords, this.activeView)
      }
    }
  }
}
);
</script>

<template>
  <div class="overlay" v-show="visible">
    <h1 class="header">Speckle <v-btn size="x-small" flat @click="addView">
        <v-icon size="x-small" icon="mdi-plus"></v-icon>
      </v-btn>
    </h1>
    <draggable v-model="views" item-key="guid" @start="onStart" @end="onEnd" class="view-list">
      <template #item="{ element: view, index }">
        <div class="draggable" :class="{ active: index === activeView }">
          <v-btn size="x-small" flat @click="setView(view.coords, index)">
            <v-icon size="x-small" icon="mdi-eye"></v-icon>
          </v-btn>
          {{ `${view.guid.split('-')[0]}` }}
          <v-btn size="x-small" flat @click="deleteView(view.guid, index)">
            <v-icon size="x-small" icon="mdi-delete"></v-icon>
          </v-btn>
        </div>
      </template>
      <template #footer>
        <div class="footer" v-if="views.length > 1">
          <v-btn size="x-small" flat @click="prevView()">
            <v-icon size="x-small" icon="mdi-arrow-left-drop-circle-outline"></v-icon>
          </v-btn>
          <!-- 
            <v-btn size="x-small" @click="play()" icon="mdi-play"></v-btn>
            <v-btn size="x-small" @click="pause()" icon="mdi-pause"></v-btn> 
          -->
          <v-btn size="x-small" flat @click="nextView()">
            <v-icon size="x-small" icon="mdi-arrow-right-drop-circle-outline"></v-icon>
          </v-btn>
        </div>
      </template>
    </draggable>
    <pre class="text-caption">{{ `Object Data Tree Loaded: Children Count -> ${JSON.stringify(
    objectData && objectData.totalChildrenCount
  )}`
    }} </pre>
  </div>
</template>

<style >
.draggable {
  cursor: move;
  /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
  height: 36px;
  align-items: center;
  border: 1px transparent solid;
  padding: 6px;
  margin-left: -8px;
  margin-right: -8px;
  margin-bottom: 4px;
}

.active {
  border-color: #ff69b4;
}

.footer {
  display: flex;
  justify-content: space-between;
}

.footer button {
  margin-top: 1em;
}

.header,
.view-lists {
  margin-bottom: 1em;
}
</style>