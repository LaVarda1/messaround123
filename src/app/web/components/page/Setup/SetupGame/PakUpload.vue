<template lang="pug">
  .pak-upload
    .upload-zone(@drop="handleFileDrop" @dragover.prevent)
      input.loader-file-input(:id="inputId" type="file" multiple name="files[]" accept=".pak" @change="handleFileSelect")
      slot
        .columns
          .column.col-12.text Drop pak files here&nbsp;
            label.browse(:for="inputId")
              | or browse
              i(:class="'icon icon-upload'")
</template>

<script>
export default {
  props: {
    inputId: {
      type: String,
      default: 'pak-file-browse'
    }
  },
  data () {
    return { loading: false }
  },
  methods: {
    handleFileDrop (e) {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.items) {
        var files = [...e.dataTransfer.items]
          .filter(item => item.kind === 'file')
          .map(item => item.getAsFile())
          
        if (!files.length) {
          return
        }
        this.$emit('uploadFiles', files)
      } else {
        if (!e.dataTransfer.files.length) {
          return
        }
        this.$emit('uploadFiles', [...e.dataTransfer.files])
      }
    },
    handleFileSelect (e) {
      if (!e.target.files.length) {
        return
      }
      this.$emit('uploadFiles', [...e.target.files])
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-zone {
  padding: 2rem;
  border:  2px grey dashed;
  .text {
    font-size: 1.5rem;
    display:flex;
    justify-content: center;
  }
  .browse {
    cursor: pointer;
    color: #8f4e28;
  }
}
</style>