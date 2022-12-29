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
            | then forked and extended with modern features.
            br 
            | Runs best in the latest Chrome browser
            p.upload Upload your pak1.pak from a purchased copy of quake in order to enjoy all mods and maps.
          
    .containers
      .columns
        .content
          p 12/28/2022 - Customizations have been updated
  h2
    .containers
      template(v-if="!packOne")
        .columns
          .column.mt-2.col-md-6.col-xs-12
            .btn.solid.btn-large.full-width(@click="start()") Start Shareware
          .column.mt-2.col-md-6.col-xs-12
            PakUpload(@uploadFiles="uploadFilesRequest" inputId="home-upload" :loading="model.loading")
              .btn.solid.btn-large.full-width
                label(for="home-upload")
                  i.icon.icon-upload
                  | &nbsp;Upload Pak1
      template(v-else)
        .columns
          .column.col-xs-6x
            .btn.solid.btn-large.full-width(@click="start()") Start
      .columns.mt-2
        .column.col-xs-12
          .btn.solid.btn-large.full-width(@click="multiplayer()") Multiplayer
  

</template>
<script lang="ts" setup>
import {reactive, onMounted, computed, watch} from 'vue'
import { useGameStore } from '../../stores/game';
import { useRoute, useRouter } from 'vue-router';
import {isId1Pak1, readPackFile} from '../../helpers/assetChecker'
import PakUpload from './Setup/SetupGame/PakUpload.vue'

const emit = defineEmits<{
  (e: 'uploaded', uploadedFiles: []): void}
>()
const router = useRouter()
const gameStore = useGameStore()
const assetMetas = computed(() => gameStore.allAssetMetas.filter(assetMeta => assetMeta.game === 'id1'))
const model = reactive<{loading: boolean}>({loading: false})
const packOne = computed(() => assetMetas.value.find(assetMeta => assetMeta.fileName.toLowerCase() === 'pak1.pak'))
const start = () => router.push({name: 'quake'})
const multiplayer = () => router.push({name: 'multiplayer'})

const processReadFile = async ({fileName, data}) => {
  const packFiles = readPackFile(data)
  if (packFiles.length === 0) {
    throw new Error("Not a valid quake pack file")
  }
  if (fileName.toLowerCase() === 'pak1.pak' && !isId1Pak1(packFiles, data)) {
    throw new Error("Pak1.pak is not the original registered quake pak")
  }
  
  return gameStore.saveAsset({game: 'id1', fileName, fileCount: packFiles.length, data})
}

const readFile = async (file) => {
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
const uploadFilesRequest = async (files) => {
  model.loading = true
  
  const promises = files.map(async file => {
    try {
      const fileObj = await readFile(file)
      await processReadFile(fileObj)
      return file.name
    } catch (e) {
      console.log(e)
      // meh.
    }
  });

  const uploadedFiles = (await Promise.all(promises)).filter(f => !!f)

  emit('uploaded', uploadedFiles)
  model.loading = false
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