<template lang="pug">
  .panel
    .panel-header
      h6 Selected: {{map.title}}
    .panel-body
      MapLoadProgress(:map="map" v-if="getMapIsLoading")
      .container(v-else)
        .columns
          .column.col-6
            a(:href="link" target="_blank") Quaddicted Details
        .columns
          .column.col-2
            .map-label QD Rating
          .column.col-2 {{map.rating}}
        .columns
          .column.col-2
            .map-label User Rating
          .column.col-2 {{map.userrating}}
        .columns
          .column.col-2
            .map-label Size
          .column.col-2 {{map.size}}
        .columns
          .column.col-2
            .map-label Start Map
          .column.col-3
            template(v-if="map.mapList.length == 1")
              .map-name {{map.mapList[0]}}
            template(v-else)
              .map-names
                select.select-sm.form-select(v-model="startMap")
                  option(v-for="m in map.mapList" :value="m") {{m}}
          .column.col-3
            .start
              button.tooltip.tooltip-left.btn(@click="play" :disabled="map.requirements.length > 0" :data-tooltip="tooltipText") Play!

    .panel-footer


</template>

<script>
import {contains} from 'ramda'
import MapLoadProgress from './MapLoadProgress.vue'
import {mapGetters} from 'vuex'

const guessStartMap = startMaps => {
  if (contains('start', startMaps)) {
    return 'start'
  }
  return startMaps[0] || ''
}
export default {
  props: {
    map: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    MapLoadProgress
  },
  data () {
    return {
      startMap: guessStartMap(this.map.mapList),
      mapLaunching: false
    }
  },
  watch: {
    map () {
      this.startMap = guessStartMap(this.map.mapList)
    }
  },
  computed: {
    ...mapGetters('maps', ['getMapIsLoading']),
    link () {
      return 'https://www.quaddicted.com/reviews/' + this.map.detailLink
    },
    tooltipText () {
      return this.map.requirements.length > 0 
      ? 'This requires loading additional resources \nwhich isn\'t supported yet:\n' + this.map.requirements.join('\n')
      : 'Download and play this map'
    }
  },
  methods: {
    play() {
      this.$emit('play', this.startMap)
    }
  }
}
</script>

<style>
</style>