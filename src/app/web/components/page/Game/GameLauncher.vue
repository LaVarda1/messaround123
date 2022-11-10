
<template lang="pug">
.game-container
  .loading.loading-lg(v-if="loading")
  template(v-else-if="needsMapDownload")
    MapLoader(:game="game" @done="mapLoaded = true")
  template(v-else)
    Game(@quit="gameQuit" :quitRequest="isQuitting")
</template>

<script lang="ts">
import {defineComponent} from 'vue'
export default defineComponent({
  beforeRouteEnter(to, from, next) {
    next((vm: any) => {
      vm.quitToPath = from.path
    })
  }
})
</script>
<script lang="ts" setup>
import Game from './Game.vue'
import MapLoader from './MapLoader.vue'
import {reactive, onMounted, computed, watch, defineProps} from 'vue'
import GameInit from '../../../../game'
import { useGameStore } from '../../../stores/game';
import { useMapsStore } from '../../../stores/maps';
import { routeLocationKey, useRoute, onBeforeRouteLeave } from 'vue-router';
import { mapState } from 'pinia';

const route = 
const gameStore = useGameStore()
const mapsStore = useMapsStore()

const model = reactive({
  map: null,
  loading: true,
  mapLoaded: false,
  isQuitting: false,
  onQuit: null,
  quitToPath: ''
})

const needsMapDownload = computed(() => !model.mapLoaded && model.game && model.map && !gameStore.hasGame(game))
const game = computed(() => routeLocationKey.query && routeLocationKey.query['-game'])
const gameQuit = () => window.location.href = model.quitToPath
onMounted(() => {
  mapsStore.loadMapListing()
    .then(() => {
      model.map = mapsStore.getMapFromId(game.value)
      model.loading = false
    })
    .catch(() => {
      model.loading = false
    })
})
onBeforeRouteLeave((to, from, next) => {
  if (model.isQuitting) {
    return next()
  }
  const answer = window.confirm('Do you really want to leave?')
  if (answer) {
    model.onQuit = next
    model.isQuitting = true
  } else {
    next(false)
  }
})
</script>
