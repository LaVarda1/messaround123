<template lang="pug">
.panel
  .panel-header
    h6 Selected: {{map.title}}
  .panel-body
    MapLoadProgress(:map="props.map" v-if="mapsStore.getMapIsLoading")
    .container(v-else)
      .columns
        .column.col-6
          a(:href="link" target="_blank") Quaddicted Details
      .columns
        .column.col-2
          .map-label QD Rating
        .column.col-2 {{props.map.rating}}
      .columns
        .column.col-2
          .map-label User Rating
        .column.col-2 {{props.map.userrating}}
      .columns
        .column.col-2
          .map-label Size
        .column.col-2 {{props.map.size}}
      .columns
        .column.col-2
          .map-label Start Map
        .column.col-3
          template(v-if="props.map.mapList.length == 1")
            .map-name {{props.map.mapList[0]}}
          template(v-else)
            .map-names
              select.select-sm.form-select(v-model="startMap")
                option(v-for="m in props.map.mapList" :value="m") {{m}}
        .column.col-3
          .start
            button.btn-sm.tooltip.tooltip-left.btn(@click="play" :disabled="props.map.requirements.length > 0" :data-tooltip="tooltipText") Play!

  .panel-footer


</template>

<script lang="ts" setup>
import {reactive, onMounted, computed, watch, defineProps} from 'vue'
import {contains} from 'ramda'
import MapLoadProgress from './MapLoadProgress.vue'
import { useMapsStore } from '../../../../stores/maps';
import { QuaddictedMap } from '../../../../types/QuaddictedMap';

const emit = defineEmits<{
  (e: 'play', startMap: string): void}
>()
const mapsStore = useMapsStore()
const guessStartMap = startMaps => {
  if (contains('start', startMaps)) {
    return 'start'
  }
  return startMaps[0] || ''
}
const props = withDefaults(defineProps<{map: QuaddictedMap | null}>(), {map: null})
const model = reactive<{
  startMap: string,
  mapLaunching: boolean
}>({startMap: guessStartMap(props.map?.mapList), mapLaunching: false})
const startMap = computed(() => guessStartMap(props.map?.mapList))
const link = computed(() => 'https://www.quaddicted.com/reviews/' + props.map?.detailLink)
const tooltipText = computed(() => props.map && props.map.requirements.length > 0 
  ? 'This requires loading additional resources \nwhich isn\'t supported yet:\n' + props.map.requirements.join('\n')
  : 'Download and play this map')

const play = () => emit('play', startMap.value)
</script>

<style>
</style>