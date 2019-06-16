<template lang="pug">
  .quaddicted-maps
    .server-error(v-if="!loading && !available")
      h5.text-error The map service seems to be down and is currently unvailable :(
    .server-error(v-if="loadMapError")
      h6.text-error The map failed to load :(
    Breakout(v-if="selectedMap" :map="selectedMap" @play="playMap")
    .search.form-group(v-if="loading || available")
      .col-3
        label.form-label(for="maps-search") Search
      .col-9
        input.form-input(type="search" placeholder="Search" v-model="search" :disabled="loading")
    Table.maps-table(v-if="loading || available" :mapList="filteredMaps" v-model="selectedMapId" :loading="loading")
  
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
      selectedMapId: '',
      loading: false,
      mapListing: [],
      loadMapError: ''
    }
  },
  mounted() {
    if (!this.getMapListing  || this.getMapListing.length <= 0) {
      this.loading = true
      this.loadMapListing()
        .then(maps => {
          this.loading = false
        })
        .catch(err => {
          this.loading = false
        })
    }
  },
  components: {
    Table,
    Breakout
  },
  computed: {
    ...mapGetters('maps', ['getMapListing']),
    available () {
      return this.getMapListing.length > 0
    },
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
    ...mapActions('maps', ['loadMap', 'loadMapListing']),
    playMap (mapName) {
      this.loadMap(this.selectedMapId)
        .then(() => {
          this.$router.push({name: 'quake', query: {
            '-game': this.selectedMapId,
            '+map': mapName
          }})
        })
        .catch(err => {
          this.loadMapError = err.message
        })
    }
  }
}
</script>
<style lang="scss">
</style>