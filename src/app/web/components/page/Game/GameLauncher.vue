
<template lang="pug">
  .game-container
    template(v-if="needsMapDownload")
      MapLoader(:game="game" @done="doneLoading = true")
    template(v-else)
      Game
</template>

<script>
import Vue from 'vue'
import Game from './Game.vue'
import MapLoader from './MapLoader.vue'
import {mapGetters} from 'vuex'

export default Vue.extend({
  components: {
    Game,
    MapLoader
  },
  data () {
    return {
      doneLoading: false
    }
  },
  computed: {
    ...mapGetters('game', ['hasGame']),
    needsMapDownload () {
      return !this.doneLoading && this.game && !this.hasGame(this.game)
    },
    game () {
      return this.$route.query && this.$route.query['-game']
    }
  }
})
</script>
