<template lang="pug">
  
</template>

<script>
import {mapActions} from 'vuex'

export default {
  props: {
    game: {
      type: String,
      required: true
    }
  },
  mounted () {},
  methods: {
    ...mapActions('maps', ['loadMap', 'loadMapListing']),
  }
}
</script>