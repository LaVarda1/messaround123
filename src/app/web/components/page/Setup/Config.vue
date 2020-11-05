<template lang="pug">
  .config
    label.form-label Quake config.cfg File
    button.btn(@click="loadRecommendedConfig") Load Recommended
    .config-editor
      textarea.form-input(placeholder="Textarea" rows="20" cols="80" :value="getConfigFile" @input="saveConfig($event.target.value)")
</template>

<script>
import {mapActions, mapGetters} from 'vuex'


export default {
  computed: {
    ...mapGetters('game', ['getConfigFile'])
  },
  methods: {
    ...mapActions('game', ['saveConfig', 'loadRecommendedConfig'])
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      vm.loadRecommendedConfig()
    })
  }
}
</script>

<style>
</style>
