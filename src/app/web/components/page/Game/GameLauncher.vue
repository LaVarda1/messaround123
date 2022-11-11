
<template lang="pug">
.game-container
  .loading.loading-lg(v-if="loading")
  template(v-else-if="needsMapDownload")
    MapLoader(:game="game" @done="mapLoaded = true")
  template(v-else)
    Game(@quit="gameQuit" :quitRequest="isQuitting")
</template>

<script lang="ts">
import { defineComponent, ComponentPublicInstance } from 'vue'
import { QuaddictedMap } from '../../../types/QuaddictedMap';

interface IInstance extends ComponentPublicInstance {
  quitToPath: string
}
export default defineComponent({
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const instance = vm as IInstance
      instance.quitToPath = from.path
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
import {  useRoute, onBeforeRouteLeave } from 'vue-router';
import { mapState } from 'pinia';

const route = useRoute()
const gameStore = useGameStore()
const mapsStore = useMapsStore()

const model = reactive<{
  map: QuaddictedMap | null,
  loading: boolean,
  mapLoaded: boolean,
  isQuitting: boolean,
  onQuit: (() => void) | null,
  quitToPath: string
}>({
  map: null,
  loading: true,
  mapLoaded: false,
  isQuitting: false,
  onQuit: null,
  quitToPath: ''
})

const game = computed(() => route.query && route.query['-game'] as string)
const needsMapDownload = computed(() => !model.mapLoaded && game.value && model.map && !gameStore.hasGame(game.value))
const gameQuit = () => window.location.href = model.quitToPath
onMounted(() => {
  mapsStore.loadMapListing()
    .then(() => {
      if (game.value) {
        model.map = mapsStore.getMapFromId(game.value)
      }
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
