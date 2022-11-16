<template lang="pug">
table.table.table-hover.table-fixed-header(:class="props.loading ? 'loading-lg loading' : ''")
  thead
    tr
      th.title
        a(@click="changeSort('title')") Title
        i.sorting.icon(v-if="model.sortBy==='title'" :class="model.sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
      th.author
        a(@click="changeSort('author')") Author(s)
        i.sorting.icon(v-if="model.sortBy==='author'" :class="model.sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
      th.date
        a(@click="changeSort('date')") Released
        i.sorting.icon(v-if="model.sortBy==='date'" :class="model.sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
      th.rating
        a(@click="changeSort('userrating')") Rating
        i.sorting.icon(v-if="model.sortBy==='userrating'" :class="model.sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
      th.size.ta-right
        a(@click="changeSort('size')") Size
        i.sorting.icon(v-if="model.sortBy==='size'" :class="model.sortOrder==='desc' ? 'icon-arrow-down' : 'icon-arrow-up'")
  tbody
    tr(v-for="map in sortedMaps" @click="selectMap(map)" :class="map.id === props.modelValue ? 'active' : ''" )
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

<script lang="ts" setup>
import {reactive, onMounted, computed, watch} from 'vue'
import type {QuaddictedMap} from '../../../../types/QuaddictedMap'

const emit = defineEmits<{
  (e: 'update:modelValue', string: string): void}
>()
const props = withDefaults(defineProps<{
  mapList: QuaddictedMap[],
  modelValue: string,
  loading: boolean
}>(), {
  mapList: [],
  modelValue: '',
  loading: false
})
const model = reactive<{sortBy: string, sortOrder: 'asc' | 'desc'}>({
  sortBy: 'date',
  sortOrder: 'asc'
})

const valueForSort = value => {
  return typeof value === 'string' ? value.toLowerCase() : value
}

const sortedMaps = computed(() => {
  return props.mapList.slice().sort((a, b) => {
    const first = valueForSort((model.sortOrder === 'desc' ? a : b)[model.sortBy])
    const second = valueForSort((model.sortOrder === 'desc' ? b : a)[model.sortBy])

    return first > second ? 1 :
      first < second ? -1 : 0
  })
})

const selectMap = (map:QuaddictedMap) => emit('update:modelValue', map.id)
const released = (date: string) => {
  const _date = new Date(date)
  const mm = _date.getMonth() + 1; // getMonth() is zero-based
  const dd = _date.getDate();

  return [_date.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
        ].join('-');
}
const rating =  (userRating) => {
  return (userRating / 5) * 100
}
const changeSort = (sortCol: string) => {
  if (model.sortBy === sortCol) {
    model.sortOrder = model.sortOrder === 'desc' ? 'asc' : 'desc'
  } else {
    model.sortBy = sortCol
    model.sortOrder = 'desc'
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
