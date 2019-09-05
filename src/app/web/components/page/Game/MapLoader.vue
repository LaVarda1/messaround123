<template lang="pug">
  .hello
    .map-load-title Need to load {{game}}
    .map-load-error(v-if="error")
    .map-load-progress(v-else)
      .container
        .columns
          .column.col-8
            div {{getMapLoadProgress.message}} {{map.fileName}}
            .bar.light-dark(ref="bar")
              .bar-text-dark {{loadedKb}}
              .bar-item(role="progressbar" :style="'width:' + progressPercent+ '%;'" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100")
                .bar-text-light(ref="barHack") {{loadedKb}}
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

const addCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export default {
  props: {
    game: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      error: '',
      map: {}
    }
  },
  mounted () {
    debugger
    // hack to make progress bar effect work.
    this.loadMapListing()
      .catch(e => {
        this.error = "Error loading map list " + e.message
        return Promise.reject(e)
      })
      .then(() => {
        this.map = this.getMapFromId(this.game)
        return this.loadMap(this.game)
          .catch(e => {
            this.error = "Error loading map " + e.message
          })
      })
    window.addEventListener('resize', this.onResize)
    this.onResize()
  },
  computed: {
    ...mapGetters('maps', ['getMapLoadProgress', 'getMapFromId']),
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
    ...mapActions('maps', ['loadMap', 'loadMapListing']),
    onResize ()  {
      this.$refs.barHack.style.width = this.$refs.bar.clientWidth + "px"
    }
  }
}
</script>

<style lang="scss" scoped>
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