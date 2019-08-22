<template lang="pug">
  .setup-game.container
    h2 Use this screen to configure what pack files you want to provide to the game
    .card
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
<style>
</style>