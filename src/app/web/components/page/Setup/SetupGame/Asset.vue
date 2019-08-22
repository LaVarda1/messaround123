<template lang="pug">
  .asset {{label}}
    template(v-if="assetMeta !== null")
      .asset-loaded.columns
        .column.col-5.asset-loaded {{assetMeta.fileName}} 
        .column.col-5.asset-fileCount {{assetMeta.fileCount}} Files
        .column.col-2.asset-remove 
          i(class="icon icon-cross" @click="remove")
</template>

<script>
import { readPackFile } from '../../../../helpers/assetChecker'
import {mapActions} from 'vuex'

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
  props: {
    label: {
      type: String,
      default: ''
    },
    game: {
      type: String,
      required: true
    },
    assetMeta: {
      type: Object,
      default: null
    },
    assetVerifier: { 
      default: null
    },
    assetVerifierFailMessage: { 
      type: String,
      default: null
    }
  },
  data () {
    return {
      loadError: '',
      loading: false
    }
  },
  methods: {
    ...mapActions('game', ['saveAsset', 'removeAsset']),
    remove() {
      this.removeAsset(this.assetMeta.assetId)
    }
  }
}
</script>
<style>
.asset {
  width: 10rem;
}
.asset-remove i {
  cursor: pointer;
}
.asset-fileCount {
}
.loader-file-input {
  display:none;
}
.asset-loader label {
  cursor: pointer;
}
</style>