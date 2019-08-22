<template lang="pug">
  .upload-zone
    .columns
      .column.col-12.text Drop pak files here 
        label.browse
          | or browse
          i(:class="'icon icon-upload' + (loading ? 'loading' : '')")
          input.loader-file-input(type="file" multiple name="files[]" @change="handleFileSelect")
</template>

<script>
export default {
  methods: {
    processReadFile({fileName, data}) {
      const packFiles = readPackFile(data)
      if (packFiles.length === 0) {
        return Promise.reject("Not a valid quake pack file")
      }
      if (this.assetVerifier && !this.assetVerifier(packFiles, data)) {
        return Promise.reject(this.assetVerifierFailMessage)
      }
      return this.saveAsset({game: this.game, fileName, fileCount: packFiles.length, data})
    },
    handleFileSelect (e) {
      const files = e.target.files
      if (files.length > 1) {
        return
      }
      const reader = new FileReader()
      this.loading = true;
      return readFile(files[0])
        .then(readFile => {
          return this.processReadFile(readFile)
            .then((assetId) => {
              this.loading = true;
              this.loadError = ''
            })
            .catch(err => {
              this.loadError = err
            })
        })
        .then(() => {
          this.loading = false;
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-zone {
  padding: 2rem;
  border:  1px grey dashed;
  .text {
    margin: auto;
    width: 100%;
  }
  .browse {
    cursor: pointer;
    color: blue;
  }
}
</style>