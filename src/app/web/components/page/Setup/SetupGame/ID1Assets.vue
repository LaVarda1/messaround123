<template lang="pug">
  .base-assets.container
    PakUpload(@uploadFiles="uploadFilesRequest" :loading="loading")
    .columns
      .column.col-12
        H4(v-if="assetMetas.length") Loaded Id1 packs
        H4(v-else) No packs loaded
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

const readFile = async file => {
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
    assetMetas () { return this.allAssetMetas.filter(assetMeta => assetMeta.game === 'id1') }
  },
  methods: {
    ...mapActions('game', ['saveAsset']),
    async processReadFile ({fileName, data}) {
      const packFiles = readPackFile(data)
      if (packFiles.length === 0) {
        throw new Error("Not a valid quake pack file")
      }
      if (fileName.toLowerCase() === 'pak1.pak' && !isId1Pak1(packFiles, data)) {
        throw new Error("Pak1.pak is not the original registered quake pak")
      }
      
      return this.saveAsset({game: 'id1', fileName, fileCount: packFiles.length, data})
    },
    async uploadFilesRequest (files) {
      this.loading = true
      
      const promises = files.map(async file => {
        try {
          const fileObj = await readFile(file)
          await this.processReadFile(fileObj)
          return file.name
        } catch (e) {
          console.log(e)
          // meh.
        }
      });

      const uploadedFiles = (await Promise.all(promises)).filter(f => !!f)

      this.$emit('uploaded', uploadedFiles)
      this.loading = false
    },
  }
}
</script>
