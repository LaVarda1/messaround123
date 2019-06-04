<template lang="pug">
  .quaddicted-maps
    Breakout(v-if="selectedMap" :map="selectedMap" @play="playMap")
    .search.form-group
      .col-3
        label.form-label(for="maps-search") Search
      .col-9
        input.form-input(type="search" placeholder="Search" v-model="search")
    Table.maps-table(:mapList="filteredMaps" v-model="selectedMapId")
  
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import Table from './Table.vue'
import Breakout from './Breakout.vue'
import {find} from 'ramda'

export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      search: '',
      selectedMapId: ''
    }
  },
  components: {
    Table,
    Breakout
  },
  computed: {
    ...mapGetters('maps', ['getMapListing']),
    filteredMaps () {
      const searchTerm = (this.search || '').trim().toLowerCase()
      return !this.search
        ? this.getMapListing
        : this.getMapListing.filter(map => 
          map.title.toLowerCase().indexOf(searchTerm) > -1 
          || map.author.toLowerCase().indexOf(searchTerm) > -1 
          || map.fileName.toLowerCase().indexOf(searchTerm) > -1
        )
    },
    selectedMap () {
      return find(map => map.id === this.selectedMapId, this.getMapListing)
    }
  },
  methods: {
    ...mapActions('maps', ['loadMap']),
    playMap (mapName) {
      this.loadMap(this.selectedMapId)
        .then(() => {
          this.$router.push({name: 'quake', query: {
            '-game': this.selectedMapId,
            '+map': mapName
          }})
        })
    }
  }
}
</script>
<style lang="scss">
</style>