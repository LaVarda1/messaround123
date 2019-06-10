<template lang="pug">
  table.table.table-hover.table-fixed-header(:class="loading ? 'loading-lg loading' : ''")
    thead
      tr
        th.title Title
        th.author Author(s)
        th.rating Rating
        th.size.ta-right Size
    tbody
      tr(v-for="map in mapList" @click="selectMap(map)" :class="map.id === value ? 'active' : ''" )
        td.title {{map.title}}
        td.author {{map.author}}
        td.rating
          .rating-container
            .star-ratings-css-top(:style="'width: ' + rating(map.userrating) + '%;'")
              span ★
              span ★
              span ★
              span ★
              span ★
            .star-ratings-css-bottom
              span ★
              span ★
              span ★
              span ★
              span ★
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
  data () {
    return {
      sortBy: 'title',
      sortOrder: 'desc'
    }
  },
  methods: {
    selectMap (map) {
      this.$emit('input', map.id)
    },
    rating (userRating) {
      return (userRating / 5) * 100
    }
  }
}
</script>
<style lang="scss">
.rating-container {
  position: relative;
  max-width: fit-content;
}
.star-ratings-css {
  unicode-bidi: bidi-override;
  font-size: 25px;
  height: 25px;
  width: 100px;
  margin: 0 auto;
  position: relative;
  padding: 0;
  text-shadow: 0px 1px 0 #e2e2e2;
  
  &-top {
    color: #8f4e28;
    padding: 0;
    position: absolute;
    z-index: 1;
    display: block;
    top: 0;
    left: 0;
    overflow: hidden;
  }
  &-bottom {
    color: #e0e0e0;
    padding: 0;
    display: block;
    z-index: 0;
  }
}
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
    &.rating {
      min-width: 100px;
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
