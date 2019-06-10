<template lang="pug">
  table.table.table-hover.table-fixed-header(:class="loading ? 'loading-lg loading' : ''")
    thead
      tr
        th.title
          a(@click="changeSort('title')") Title
          i.sorting.icon(v-if="sortBy==='title'" :class="sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
        th.author
          a(@click="changeSort('author')") Author(s)
          i.sorting.icon(v-if="sortBy==='author'" :class="sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
        th.date
          a(@click="changeSort('date')") Released
          i.sorting.icon(v-if="sortBy==='date'" :class="sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
        th.rating
          a(@click="changeSort('userrating')") Rating
          i.sorting.icon(v-if="sortBy==='userrating'" :class="sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
        th.size.ta-right
          a(@click="changeSort('size')") Size
          i.sorting.icon(v-if="sortBy==='size'" :class="sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
    tbody
      tr(v-for="map in sortedMaps" @click="selectMap(map)" :class="map.id === value ? 'active' : ''" )
        td.title {{map.title}}
        td.author {{map.author}}
        td.date {{released(map.date)}}
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

const valueForSort = value => {
  return typeof value === 'string' ? value.toLowerCase() : value
}

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
  computed: {
    sortedMaps () {
      return this.mapList.slice().sort((a, b) => {
        const first = valueForSort((this.sortOrder === 'desc' ? a : b)[this.sortBy])
        const second = valueForSort((this.sortOrder === 'desc' ? b : a)[this.sortBy])

        return first > second ? 1 :
          first < second ? -1 : 0
      })
    }
  },
  data () {
    return {
      sortBy: 'date',
      sortOrder: 'asc'
    }
  },
  methods: {
    selectMap (map) {
      this.$emit('input', map.id)
    },
    released (date) {
      const _date = new Date(date)
      var mm = _date.getMonth() + 1; // getMonth() is zero-based
      var dd = _date.getDate();

      return [_date.getFullYear(),
              (mm>9 ? '' : '0') + mm,
              (dd>9 ? '' : '0') + dd
            ].join('-');
    },
    rating (userRating) {
      return (userRating / 5) * 100
    },
    changeSort (sortCol) {
      if (this.sortBy === sortCol) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      } else {
        this.sortBy = sortCol
        this.sortOrder = 'desc'
      }
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
.sorting {
  padding-left: 1rem;
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
    &.date {
      min-width: 100px;
    }
    &.rating {
      min-width: 100px;
    }
    &.size {
      min-width: 100px;
    }
  }
  th a {
    cursor: pointer;
  }
}
.ta-right {
  text-align: right;
}
</style>
