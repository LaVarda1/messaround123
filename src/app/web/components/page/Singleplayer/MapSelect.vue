<template lang="pug">
.map-select
  select.form-select(@change="$emit('input', $event.target.value)")
    option(v-for="map in mapList" :value="map.name") {{getMapDisplay(map)}}
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    mapList: {
      type: Array,
      default: []
    },
  },
  data () {
    return {
      initialValue: this.value
    }
  },
  methods: {
    getMapDisplay (map) {
      return map.collection ? `${map.collection} - ${map.title}` : map.title
    }
  }
}
</script>
