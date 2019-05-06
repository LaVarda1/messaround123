<template lang="pug">
  .map-select
    select.form-select(@change="$emit('input', $event.target.value)")
      option(v-for="map in availableMaps" :value="map.name") {{getMapDisplay(map)}}

  
  
</template>

<script>
import {mapGetters} from 'vuex'
import gameType from '../../../helpers/gameType'
import mapList from '../../../helpers/mapList'

export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters('game', ['hasRegistered']),
    availableMaps () {
      return mapList
        .filter(map => this.hasRegistered || map.game === gameType.ShareWare)
    }
  },
  data () {
    return {
      initialValue: this.value
    }
  },
  methods: {
    getMapDisplay (map) {
      return map.collection ? `${map.collection} - ${map.title}` : map.title
    }
  }
}
</script>
