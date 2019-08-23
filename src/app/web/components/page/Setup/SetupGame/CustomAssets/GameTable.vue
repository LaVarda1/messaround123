<template lang="pug">
  tbody
    tr.fixed
      td
        div.basic-button(@click="toggleExpand")
          i.icon(style="margin: .3rem;" :class="expanded ? 'icon-minus' : 'icon-plus'")
      td.title {{gameDisplay}}
      td.size {{metaList.length}} Files
      td.removal
        div.basic-button(@click="remove")
          i.icon.icon-cross(style="margin: .3rem; color: red")
    
    tr.scroll(v-if="expanded")
      table.file-table
        tr(v-for="customAsset in metaList")
          td.filename {{customAsset.fileName}}
</template>


<script>
// import {getAllMeta} from '../../../../../shared/indexeddb'
import {groupBy, keys, find} from 'ramda'
import {mapGetters} from 'vuex'

export default {
  props: {
    metaList: {
      type: Array,
      default: () => []
    },
    game: {
      type: String,
      default: ''
    }
  },
  components: {
  },
  data () {
    return {
      expanded: false
    }
  },
  computed: {
    ...mapGetters('maps', ['getMapListing']),
    gameDisplay () {
      const mapsItem = find(m => m.id === this.game, this.getMapListing)
      return mapsItem ? mapsItem.title : this.game
    }
  },
  methods: {
    toggleExpand () {
      this.expanded = !this.expanded
    },
    remove () {
      this.$emit('remove', this.game)
    }
  }
}
</script>

<style scoped lang="scss">
.basic-button {
  border: solid 1px #bbb;
  cursor: pointer;
  :hover {
    background-color: #ddd
  }
}
.file-table {
  width: 100%;
}
td.size {
  text-align: right;
}

tr.scroll {
  display: block;
  overflow: auto;
  max-height: 15rem;
}
tr.fixed {
  display:block;
}
th, td {
  vertical-align: top;
  &.title {
    width: 100%;
  }
  &.size {
    min-width: 100px;
  }
  &.filename {
    width: 100%;
    padding-left: 2rem;
  }
}
</style>