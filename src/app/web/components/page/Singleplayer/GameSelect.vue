<template lang="pug">
.map-select
  select.form-select(@change="$emit('input', $event.target.value)")
    option(v-for="game in gameList" :value="game.game") {{game.name}}
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    gameList: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      initialValue: this.value
    }
  }
}
</script>
