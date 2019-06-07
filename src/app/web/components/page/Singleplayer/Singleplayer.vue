<template lang="pug">
  .singleplayer
    .container
      .column.col-12
        .panel
          .panel-header
            .panel-title
              h5 Normal Quake
          .panel-body
            button.btn(@click="start()") Start Game
          .panel-footer
        
        .panel
          .panel-header
            .panel-title
              h5 Original Map Selection
          .panel-body
            .container
              .column.col-6
                MapSelect(v-model="mapSelection")
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
import {mapGetters, mapMutations} from 'vuex'
import MapSelect from './MapSelect.vue'
import Quaddicted from './Quaddicted/Quaddicted.vue'

export default {
  components: {
    MapSelect,
    Quaddicted
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
<style lang="scss">
.panel {
  margin-top: 1rem;
}
</style>
