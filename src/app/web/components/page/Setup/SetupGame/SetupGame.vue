<template lang="pug">
  .setup-game.container
    h4 Currently loaded files in your browser
    .card.id1-loade
      h5 Pak files from your id1 directory
      p In order to play later episodes or modified games, 
       | you must provide your own pak1 file - usually located
       | in your quake\id1 directory.

      ID1Assets
    .card
      CustomAssets
</template>

<script>
import CustomAssets from './CustomAssets/CustomAssets.vue'
import ID1Assets from './ID1Assets.vue'

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
  }
}
</script>
<style lang="scss">
.setup-game.container {
  .card {
    padding: 0 .8rem;
  }
}
</style>