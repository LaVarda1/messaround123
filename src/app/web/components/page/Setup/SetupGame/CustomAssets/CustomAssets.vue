<template lang="pug">
  .custom-assets
    h4.container Mods / Maps
    table.table.table-hover(:class="loading ? 'loading-lg loading' : ''")
      GameTable(v-for="(value, prop, idx) in groupedAssets" 
        :metaList="value" 
        :game="prop" 
        :key="prop"
        @remove="removeGame")

</template>

<script>
// import {getAllMeta} from '../../../../helpers/indexeddb'
import {groupBy, keys, find} from 'ramda'
import {mapGetters, mapActions} from 'vuex'
import GameTable from './GameTable.vue'
import {removeGame} from '../../../../../../../shared/indexeddb'

export default {
  components: {
    GameTable
  },
  props: {
    assetMetas: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      storeNames: [],
      selectedStore: 'id1',
      loading: false
    }
  },
  computed: {
    ...mapGetters('game', ['allAssetMetas']),
    ...mapGetters('maps', ['getMapListing']),
    groupedAssets () {
      return groupBy(e => e.game, this.allAssetMetas)
    }
    // gameList () {
    //   return keys(groupBy(d => d.game, this.assetMetas))
    // }
  },
  // mounted () {
  //   getAllMeta()
  //     .then(metas => {
  //       this.storeNames = metas.map(meta => meta.game)
  //       this.loading = false
  //     })
  //     .catch(() => {
  //       this.loading = false
  //     })
  // },
  methods: {
    ...mapActions('game', ['loadAssets']),
    removeGame (game) {
      return removeGame(game)
        .then(this.loadAssets)
    }
  }
}
</script>
