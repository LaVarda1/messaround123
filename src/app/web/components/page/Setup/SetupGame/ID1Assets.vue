<template lang="pug">
  .base-assets.container
    h3 Base Game
    h5 Here you may configure the base game "pak" files found in the id1 directory. Pak0 is optional, but Pak1 is required if you want to play the full registered game or any custom maps or mods.

    PakUpload
    .columns
      .column.col-12
        H6(v-if="assetMetas.length") Loaded Id1 packs
        H6(v-else) No packs loaded
        Asset(v-for="meta in assetMetas"
          :assetMeta="meta"
          :label="meta.filename"
          game="id1")

</template>

<script>
import Asset from './Asset.vue'
import PakUpload from './PakUpload.vue'
import {isId1Pak1} from '../../../../helpers/assetChecker'

export default {
  props: {
    assetMetas: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      isId1Pak1
    }
  },
  components: {
    Asset,
    PakUpload
  },
  computed: {
    packOne() {
      return this.assetMetas.find(assetMeta => assetMeta.fileName.toLowerCase() === 'pak1.pak')
    },
    packZero() { 
      return this.assetMetas.find(assetMeta => assetMeta.fileName.toLowerCase() === 'pak0.pak')
    }
  }
}
</script>
