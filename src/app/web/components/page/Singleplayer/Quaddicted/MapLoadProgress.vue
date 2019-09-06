<template lang="pug">
  .map-load-progress
    .container
      .columns
        .column.col-3
          div {{getMapLoadProgress.message}} {{map.fileName}}
          .bar.light-dark(ref="bar")
            .bar-text-dark {{loadedKb}}
            .bar-item(role="progressbar" :style="'width:' + progressPercent+ '%;'" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100")
              .bar-text-light(ref="barHack") {{loadedKb}}
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
  mounted () {
    // hack to make progress bar effect work.
    window.addEventListener('resize', this.onResize)
    this.onResize()
  },
  computed: {
    ...mapGetters('maps', ['getMapLoadProgress']),
    loadedKb () {
      if (!this.getMapLoadProgress.total) {
        return ''
      }
      const total = addCommas(Math.floor(this.getMapLoadProgress.total / 1024))
      const loaded = addCommas(Math.floor(this.getMapLoadProgress.loaded / 1024))

      return `${loaded} / ${total} KB`
    },
    progressPercent () {
      if (!this.getMapLoadProgress.total) {
        return 0
      }
      const total = Math.floor(this.getMapLoadProgress.total)
      const loaded = Math.floor(this.getMapLoadProgress.loaded)
      return Math.ceil((loaded / total) * 100)
    }
  },
  methods: {
    onResize ()  {
      this.$refs.barHack.style.width = this.$refs.bar.clientWidth + "px"
    }
  }
}
</script>
<style scoped lang="scss">
// I spent more time on this than I'd like to admit.
.bar.light-dark {
  position: relative;
  .bar-item {
    overflow: hidden;
    position: absolute;
    .bar-text-light {
      position: absolute;
      text-align: right;
      color: white;
      font-size: .6rem;
    }
  }
  .bar-text-dark {
    line-height: 0.8rem;
    height: 0.8rem;
    position: absolute;
    width: 100%;
    text-align: right;
    color: black;
    font-size: .6rem;
  }
}
</style>
