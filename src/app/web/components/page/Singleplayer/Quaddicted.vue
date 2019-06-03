<template lang="pug">
  table.table
    thead
      tr
        th title
        th author
        th
    tbody
      tr(v-for="map in getMapListing")
        td {{map.title}}
        td {{map.author}}
        td
          a(@click="playMap(map)") Play it
  
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import gameType from '../../../helpers/gameType'

export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters('maps', ['getMapListing'])
    // availableMaps () {
    //   return mapList
    //     .filter(map => this.hasRegistered || map.game === gameType.ShareWare)
    // }
  },
  data () {
    return {
      initialValue: this.value
    }
  },
  methods: {
    ...mapActions('maps', ['loadMap']),
    playMap (map) {
      this.loadMap(map.id)
        .then(() => {
          this.$router.push({name: 'quake', query: {
            '-game': map.id,
            '+map': map.title.substr(0, map.title.indexOf('.'))
          }})
        })
      return map.collection ? `${map.collection} - ${map.title}` : map.title
    }
  }
}
</script>
