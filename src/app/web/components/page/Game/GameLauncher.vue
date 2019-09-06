
<template lang="pug">
  .game-container
    .loading.loading-lg(v-if="loading")
    template(v-else-if="needsMapDownload")
      MapLoader(:game="game" @done="mapLoaded = true")
    template(v-else)
      Game(@quit="gameQuit" :quitRequest="isQuitting")
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
      mapLoaded: false,
      isQuitting: false,
      onQuit: null,
      quitToPath: ''
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
    gameQuit () {
      // Navigating to force clear memory.
      
      window.location.href = this.quitToPath
      // Joe - Originally this is navigate back. 
      // if (this.onQuit) {
      //   this.onQuit()
      // } else {
      //   
      //   // this.$router.go(-1)
      //   window.location.href = this.quitToPath
      // }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.quitToPath = from.path
    })
  },
  beforeRouteLeave (to, from, next) {
    if (this.isQuitting) {
      return next()
    }
    const answer = window.confirm('Do you really want to leave?')
    if (answer) {
      this.onQuit = next
      this.isQuitting = true
    } else {
      next(false)
    }
  }
})
</script>
