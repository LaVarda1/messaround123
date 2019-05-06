<template lang="pug">
  .singleplayer
    .container
      .column.col-8
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
              h5 Map Selection
          .panel-body
            .container
              .column.col-6
                MapSelect(v-model="mapSelection")
          .panel-footer
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
<style lang="scss">
.panel {
  margin-top: 1rem;
}
</style>
