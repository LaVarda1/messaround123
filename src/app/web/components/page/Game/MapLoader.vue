<template lang="pug">
.hello
  .container.grid-lg
    .column.col-12
      .panel
        .panel-header
          .panel-title
            h5 Loading from Quaddicted: {{model.map.title}}
        .panel-body
          .map-load-error(v-if="error") {{error}}
          .map-load-progress(v-else) 
            .container
              .columns
                .column.col-12
                  div {{getMapLoadProgress.message}} {{model.map.fileName}}
                  .bar.light-dark(ref="bar")
                    .bar-text-dark {{loadedKb}}
                    .bar-item(role="progressbar" :style="'width:' + progressPercent+ '%;'" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100")
                      .bar-text-light(ref="barHack")
        .panel-footer
</template>

<script lang="ts" setup>
import {reactive, onMounted, computed, watch, ref} from 'vue'
import { useMapsStore } from '../../../stores/maps';
import type { QuaddictedMap } from '../../../types/QuaddictedMap';

const mapsStore = useMapsStore()

const emit = defineEmits<{
  (e: 'done'): void}
>()

const bar = ref<HTMLElement | null>(null)
const barHack = ref<HTMLElement | null>(null)
const props = defineProps<{game: string}>()
const model = reactive<{
  map: QuaddictedMap | null, 
  error: string
}>({
  map: null, 
  error: ''
})

const onResize = () => {
  if (barHack.value && bar.value) {
    barHack.value.style.width = bar.value.clientWidth + "px"
  }
}

const addCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const loadedKb = computed(() => {
  if (!mapsStore.getMapLoadProgress.total) {
    return ''
  }
  const total = addCommas(Math.floor(mapsStore.getMapLoadProgress.total / 1024))
  const loaded = addCommas(Math.floor(mapsStore.getMapLoadProgress.loaded / 1024))

  return `${loaded} / ${total} KB`
})

const progressPercent = computed(() => {
  if (!mapsStore.getMapLoadProgress.total) {
    return 0
  }
  const total = Math.floor(mapsStore.getMapLoadProgress.total)
  const loaded = Math.floor(mapsStore.getMapLoadProgress.loaded)
  return Math.ceil((loaded / total) * 100)
})

onMounted(() => {
  mapsStore.loadMapListing()
    .catch(e => {
      model.error = "Error loading map list " + e.message
      return Promise.reject(e)
    })
    .then(() => {
      model.map = mapsStore.getMapFromId(props.game)
      if (model.map) {
        return mapsStore.loadMap(props.game)
          .then(() => emit('done'))
          .catch(e => {
            model.error = "Error loading map " + e.message
          })
      } else {
        model.error = 'Game is not recognized'
      }
    })
  window.addEventListener('resize', onResize)
  onResize()
})
</script>

<style lang="scss" scoped>
.bar.light-dark {
  height: 1.8rem;
  position: relative;
  .bar-item {
    overflow: hidden;
    position: absolute;
    .bar-text-light {
      position: absolute;
      text-align: right;
      color: white;
      font-size: 1.4rem;
    }
  }
  .bar-text-dark {
    line-height: 1.8rem;
    height: 1.8rem;
    position: absolute;
    width: 100%;
    text-align: right;
    color: black;
    font-size: 1.4rem;
  }
}
</style>