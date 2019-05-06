<template lang="pug">
  .singleplayer
    .panel
      .panel-title Vanilla Game
        button.btn(@click="start()") Start Game
    
    .panel
      .panel-title Map Selection
        .container
          .column.col-6
            MapSelect(v-model="mapSelection")
      button.btn(@click="startCustom()") Start Game

        
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import MapSelect from './MapSelect.vue'

export default {
  components: {
    MapSelect
  },
  data () {
    return {
      mapSelection: ''
    }
  },
  methods: {
    start() {
      this.$router.push({name: 'quake'})
    },
    startCustom () {
      this.$router.push({name: 'quake', query: {'+map': this.mapSelection}})
    }
  }
}
</script>
