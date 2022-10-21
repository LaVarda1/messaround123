<template lang="pug">
  .home
    h1 Quake1 in your browser 
    p
      .containers
        .columns
          .column
            .content
              | First written by 
              a(href="https://github.com/Triang3l/WebQuake") Triang3l 
              |
              | then forked and extended to support a few more features.
              br 
              | This version uses the latest HTML5 API's which will not work in older browsers.
              p.upload Upload your pak1.pak from a purchased copy of quake in order to enjoy all mods and maps.


    h2
      .containers
        v-template(v-if="!packOne")
          .columns
            .column.mt-2.col-md-6.col-xs-12
              .btn.solid.btn-large.full-width(@click="start()") Start Shareware
            .column.mt-2.col-md-6.col-xs-12
              PakUpload(@uploadFiles="uploadFilesRequest" inputId="home-upload" :loading="loading")
                .btn.solid.btn-large.full-width
                  label(for="home-upload")
                    i.icon.icon-upload
                    | &nbsp;Upload Pak1
        v-template(v-else)
          .columns
            .column.col-xs-6x
              .btn.solid.btn-large.full-width(@click="start()") Start
        .columns.mt-2
          .column.col-xs-12
            .btn.solid.btn-large.full-width(@click="multiplayer()") Multiplayer

</template>
<script>
import {mapActions, mapGetters} from 'vuex'
import {isId1Pak1, readPackFile} from '../../helpers/assetChecker'
import PakUpload from './Setup/SetupGame/PakUpload.vue'

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
  data: {
    loading: false
  },
  components: {
    PakUpload
  },
  computed: {
    ...mapGetters('game', ['allAssetMetas']),
    assetMetas () { return this.allAssetMetas.filter(assetMeta => assetMeta.game === 'id1') },
    packOne() {
      return this.assetMetas.find(assetMeta => assetMeta.fileName.toLowerCase() === 'pak1.pak')
    }
  },
  methods: {
    ...mapActions('game', ['saveAsset']),
    start() {
      this.$router.push({name: 'quake'})
    },
    multiplayer() {
      this.$router.push({name: 'multiplayer'})
    },
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
<style lang="scss">
.upload-zone {
  padding: 0 !important;
  border: none !important;
}
.upload {
  margin-top: 1rem;
}
.footer {
  margin-top: 200px;
}
</style>