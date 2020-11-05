<template lang="pug">
  .config
    label.form-label Quake autoexec.cfg File
    button.btn(@click="loadRecommendedAutoexec") Load Recommended
    .config-editor
      textarea.form-input(placeholder="Textarea" rows="20" cols="80" :value="getAutoexecFile" @input="saveAutoexec($event.target.value)")
</template>

<script>
import {mapActions, mapGetters} from 'vuex'


export default {
  computed: {
    ...mapGetters('game', ['getAutoexecFile'])
  },
  methods: {
    ...mapActions('game', ['saveAutoexec', 'loadRecommendedAutoexec'])
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      vm.loadRecommendedAutoexec()
    })
  }
}
</script>

<style>
</style>
