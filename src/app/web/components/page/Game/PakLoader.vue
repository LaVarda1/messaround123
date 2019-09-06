<template lang="pug">
  #lateregistered
    .uploader
      H3 You must load the original Pak1.pak to play registered games
      a(href="/") Nevermind, take me back.
      Id1Assets(@uploaded="pakUploaded")
</template>

<script>
import Id1Assets from '../../page/Setup/SetupGame/ID1Assets.vue'
export default {
  components: {
    Id1Assets
  },
  methods: {
    pakUploaded (files) {
      if (files.some(f => f.toLowerCase() === 'pak1.pak')) {
        this.$emit('done')
      }
    }
  }
}
</script>