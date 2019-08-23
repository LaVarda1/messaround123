<template lang="pug">
  .base-assets.container
    h3 Base Game
    h5 Here you may configure the base game "pak" files found in the id1 directory. Pak0 is optional, but Pak1 is required if you want to play the full registered game or any custom maps or mods.

    PakUpload(@uploadFiles="uploadFilesRequest" :loading="loading")
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
import {isId1Pak1, readPackFile} from '../../../../helpers/assetChecker'
import {mapActions, mapGetters} from 'vuex'

const readFile = file => {
  return new Promise((resolve, reject) => {
    const fileName = file.name
    const reader = new FileReader()
    reader.onloadend = loadEvt => {
      resolve({
        fileName,
        data: loadEvt.target.result
      })
    }
    reader.onerror = (e) => reject(e)
    reader.readAsArrayBuffer(file)
  })
}

export default {
  data() {
    return {
      isId1Pak1,
      loading: false
    }
  },
  components: {
    Asset,
    PakUpload
  },
  computed: {
    ...mapGetters('game', ['allAssetMetas']),
    assetMetas () { return this.allAssetMetas.filter(assetMeta => assetMeta.game === 'id1') },
    packOne() {
      return this.assetMetas.find(assetMeta => assetMeta.fileName.toLowerCase() === 'pak1.pak')
    },
    packZero() { 
      return this.assetMetas.find(assetMeta => assetMeta.fileName.toLowerCase() === 'pak0.pak')
    }
  },
  methods: {
    ...mapActions('game', ['saveAsset']),
    processReadFile ({fileName, data}) {
      const packFiles = readPackFile(data)
      if (packFiles.length === 0) {
        return Promise.reject("Not a valid quake pack file")
      }
      if (fileName.toLowerCase() === 'pak1.pak' && !isId1Pak1(packFiles, data)) {
        return Promise.reject("Pak1.pak is not the original registered quake pak")
      }
      const payload = {game: 'id1', fileName, fileCount: packFiles.length, data}

      return this.saveAsset(payload)
    },
    async uploadFilesRequest (files) {
      this.loading = true
      
      files.forEach(async file => {
        try {
          await this.processReadFile(await readFile(file))
        } catch (e) {
          // meh.
        }
      });

      this.loading = false
    },
  }
}
</script>
