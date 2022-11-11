<template lang="pug">
.pak-upload
  .upload-zone(@drop="handleFileDrop" @dragover.prevent)
    input.loader-file-input(:id="props.inputId" type="file" multiple name="files[]" accept=".pak" @change="handleFileSelect")
    slot
      .columns
        .column.col-12.text Drop pak files here&nbsp;
          label.browse(:for="props.inputId")
            | or browse
            i(:class="'icon icon-upload'")
</template>

<script lang="ts" setup>
import {reactive, defineProps} from 'vue'

const emit = defineEmits<{
  (e: 'uploadFiles', files: File[]): void}
>()
const props = withDefaults(defineProps<{inputId: string}>(), {inputId: 'pak-file-browse'})
const model = reactive<{loading: boolean}>({loading: false})

const handleFileDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (e.dataTransfer && e.dataTransfer.items) {
    var files = [...e.dataTransfer.items]
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter(file => !!file)
      
    if (!files.length) {
      return
    }
    emit('uploadFiles', files as File[])
  } else {
    if (!e.dataTransfer || e.dataTransfer.files.length) {
      return
    }
    emit('uploadFiles', [...e.dataTransfer.files])
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target?.files?.length) {
    return
  }
  emit('uploadFiles', [...target.files])
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