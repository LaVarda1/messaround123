
<template lang="pug">
  .game-container
    .loading.loading-lg(v-if="loading")
    template(v-else-if="needsMapDownload")
      MapLoader(:game="game" @done="mapLoaded = true")
    template(v-else)
      Game
</template>

<script>
import Vue from 'vue'
import Game from './Game.vue'
import MapLoader from './MapLoader.vue'
import {mapGetters, mapActions} from 'vuex'

export default Vue.extend({
  components: {
    Game,
    MapLoader
  },
  data () {
    return {
      map: null,
      loading: true,
      mapLoaded: false
    }
  },
  mounted () {
    this.loadMapListing()
      .then(() => {
        this.map = this.getMapFromId(this.game)
        this.loading = false
      })
      .catch(() => {
        this.loading = false
      })
  },
  computed: {
    ...mapGetters('maps', ['getMapFromId']),
    ...mapGetters('game', ['hasGame']),
    needsMapDownload () {
      return !this.mapLoaded && this.game && this.map && !this.hasGame(this.game)
    },
    game () {
      return this.$route.query && this.$route.query['-game']
    }
  },
  methods: {
    ...mapActions('maps', ['loadMapListing']),
  }
})
</script>
