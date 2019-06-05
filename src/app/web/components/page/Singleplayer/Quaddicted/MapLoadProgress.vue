<template lang="pug">
  .map-load-progress
    div Loading {{map.fileName}}
    .progress {{getMapLoadProgress.message}} {{loadedKb}}
</template>

<script>
import {mapGetters} from 'vuex'

const addCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export default {
  props: {
    map: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapGetters('maps', ['getMapLoadProgress']),
    loadedKb () {
      if (!this.getMapLoadProgress.total) {
        return ''
      }
      const total = addCommas(Math.floor(this.getMapLoadProgress.total / 1024))
      const loaded = addCommas(Math.floor(this.getMapLoadProgress.loaded / 1024))

      return `${loaded}/${total} KB`
      
    }
  }
}
</script>
