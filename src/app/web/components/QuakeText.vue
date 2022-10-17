<template lang="pug">
.name-label
  img(:src="valueImg")
</template>

<script>
import { createWriter } from "../helpers/charmap"
export default {
  props: {
    size: {
      type: Number,
      default: 12
    },
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      valueImg: ''
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.generateImage()
      },
      immediate: true
    }
  },
  methods: {
    generateImage() {
      return createWriter() 
        .then(writer => writer.write(this.size, btoa(this.value)))
        .then(nameImg => {
          this.valueImg = nameImg
        })
    }
  }
}
</script>

<style>

</style>
