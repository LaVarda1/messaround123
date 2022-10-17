<template lang="pug">
.singleplayer
  .container
    .column.col-12        
      .panel
        .panel-header
          .panel-title
            h5 Quake 1
        .panel-body
          .container
            .column.col-6(v-if="hasRegistered")
              GameSelect(v-model="gameSelection" :gameList="games")
            .column.col-6
              MapSelect(v-model="mapSelection" :mapList="mapList")
        .panel-footer
          button.btn(@click="startCustom()") Start Game
      .panel
        .panel-header
          .panel-title
            h5 Quaddicted Custom Map Selection
            .note Note: This is still experimental. Webquake may 
              span.text-error not 
              | work with some of the more advanced mods. If you own a mod that is unsupported with webquake and know why, please
              |  fill out an issue 
              a(href="https://gitlab.com/joe.lukacovic/netquake.io/issues" target="_blank") here  
              |  with your mod name and what feature needs to be added to webquake to support your mod
              
        .panel-body
          .container
            .column.col-12
              Quaddicted
        .panel-footer
</template>

<script>
import {mapGetters} from 'vuex'
import gameType from '../../../helpers/gameType'
import GameSelect from './GameSelect.vue'
import MapSelect from './MapSelect.vue'
import Quaddicted from './Quaddicted/Quaddicted.vue'
import games from '../../../helpers/games'

export default {
  components: {
    MapSelect,
    Quaddicted,
    GameSelect
  },
  data () {
    return {
      games,
      mapSelection: 'start',
      gameSelection: 'original'
    }
  },
  computed: {
    ...mapGetters('game', ['hasRegistered']),
    gameObj () {
      return games.find(g => g.game === this.gameSelection)
    },
    mapList () {
      return this.gameObj.mapList
        .filter(map => this.hasRegistered || map.gameType === gameType.ShareWare)
    }
  },
  methods: {
    start() {
      this.$router.push({name: 'quake'})
    },
    startCustom () {
      const query = {'+map': this.mapSelection}
      if (this.gameObj.game !== 'original') {
        query['-' + this.gameObj.game] = true
      }
      this.$router.push({name: 'quake', query})
    }
  }
}
</script>
<style lang="scss">
.panel {
  margin-top: 1rem;
}
</style>
