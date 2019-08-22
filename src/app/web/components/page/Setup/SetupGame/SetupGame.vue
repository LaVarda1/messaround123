<template lang="pug">
  .setup-game.container
    h2 Use this screen to configure what pack files you want to provide to the game
    .card
      ID1Assets(:assetMetas="id1Assets")
    .card
      CustomAssets
</template>

<script>
import CustomAssets from './CustomAssets/CustomAssets.vue'
import ID1Assets from './ID1Assets.vue'
import { mapGetters } from 'vuex'

export default {
  data () {
    return { 
      loading: true
    }
  },
  components: {
    CustomAssets,
    ID1Assets
  },
  computed: {
    ...mapGetters('game', ['allAssetMetas']),
    id1Assets() { return this.allAssetMetas.filter(assetMeta => assetMeta.game === 'id1') }
  }
}
</script>
<style>
</style>