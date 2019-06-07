<template lang="pug">
  table.table.table-hover.table-fixed-header(:class="loading ? 'loading-lg loading' : ''")
    thead
      tr
        th.title Title
        th.author Author(s)
        th.size.ta-right Size
    tbody
      tr(v-for="map in mapList" @click="selectMap(map)" :class="map.id === value ? 'active' : ''" )
        td.title {{map.title}}
        td.author {{map.author}}
        td.size.ta-right {{map.size}}
  
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

export default {
  props: {
    mapList: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    selectMap (map) {
      this.$emit('input', map.id)
    }
  }
}
</script>
<style lang="scss">
.table-fixed-header {
  tbody {
    display: block;
    overflow: auto;
    max-height: 15rem;
  }
  thead tr{
    display:block;
    padding-right: 20px;
  }
  th, td {
    vertical-align: top;
    &.title {
      width: 100%;
    }
    &.author {
      min-width: 300px;
    }
    &.size {
      min-width: 100px;
    }
  }
}
.ta-right {
  text-align: right;
}
</style>
