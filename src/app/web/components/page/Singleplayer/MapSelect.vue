<template lang="pug">
  .map-select
    select.form-select(@change="$emit('input', $event.target.value)")
      option(v-for="map in maps" :value="map") {{map}}

  
  
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      initialValue: this.value,
      maps: [
        'start',
        'e1m1',
        'e1m2',
        'e1m3',
        'e1m4',
        'e1m5',
        'e1m6',
        'e1m7'
      ]
    }
  }
}
</script>
