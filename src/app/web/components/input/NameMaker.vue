<template lang="pug">
.name-maker
  input(ref="input" @blur="inputLostFocus" :value="value" @input="$emit('input', $event.target.value)" @keydown="inputKeyDown")
  .buttons
    button.btn(@click="space") Space
    button.btn(@click="backspace") Backspace
    button.btn.right(@click="done") Done
  canvas(ref="the-canvas" :height="charsetSize" :width="charsetSize" @mousemove="canvashover" @click="canvasclick")
</template>

<script>
import Vue from 'vue'

const blockedChars = [0,9,10,12,13,173]
const maxLength = 15
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      image: '',
      charsetSize: 512,
      name: this.value,
      hoverPosition: {x: -1, y: -1}
    }
  },
  watch: {
    value (newValue) {
      this.name = newValue
    }
  },
  methods: {
    backspace () {
      if (this.name.length) {
        const input = this.$refs["input"]
        const selectionStart = input.selectionStart
        const selectionEnd = input.selectionEnd
        const newName = this.name.slice(0, selectionStart - 1) + this.name.slice(selectionEnd);
        
        this.change(newName)
        Vue.nextTick(() => {
          input.focus()
          input.selectionEnd = selectionStart - 1
        })
      }
    },
    space () {
      if (this.name.length <= maxLength) {
        this.insertCharacter(' ')
      }
    },
    done() {
      if (!this.name) {
        this.$emit('input', 'player')
      }
      // hack because for some reason the above doesn't trigger change if done is executed the same time.
      Vue.nextTick(() => this.$emit('done'))
      
    },
    inputLostFocus() {
      const input = this.$refs["input"]
    },
    inputKeyDown(e) {
      const key = e.key
      if (key === "Backspace" || key === "Delete" || key==="ArrowLeft" || key==="ArrowRight") {
        return
      }
      if (this.name.length > maxLength) {
        e.preventDefault()
        return false
      }
    },
    change (newName) {
      if (this.name.length <= maxLength) {
        this.$emit('input', newName)
      }
    },
    insertCharacter(char){
      const input = this.$refs["input"]
      const selectionStart = input.selectionStart
      const selectionEnd = input.selectionEnd
      const newName = this.name.slice(0, selectionStart) + char + this.name.slice(selectionEnd);
      
      if (newName.length <= maxLength) {
        this.change(newName)
        Vue.nextTick(() => {
          input.focus()
          input.selectionEnd = selectionStart + char.length
        })
      }
    },
    getCharCode(width, offsetX, offsetY) {
      const blockSize = width / 16
      const x = Math.floor(offsetX / blockSize),
            y = Math.floor(offsetY / blockSize)
      return x + (y * 16)
    },
    canvasclick(e) {
      const canvas = this.$refs["the-canvas"]
      const charCode = this.getCharCode(canvas.clientWidth, e.offsetX, e.offsetY)
      
      if (!blockedChars.includes(charCode)) {

        const char = String.fromCharCode(charCode);
        return this.insertCharacter(char)
      }
    },
    canvashover(e) {
      this.hoverPosition = {x: e.offsetX, y: e.offsetY}
      const canvas = this.$refs["the-canvas"]
      if (canvas.getContext) {
        const ctx = canvas.getContext('2d');

        const ratio = this.charsetSize / canvas.clientWidth
        const size = this.charsetSize / 16;
        const x = Math.floor((this.hoverPosition.x * ratio) / size) * size
        const y = Math.floor((this.hoverPosition.y * ratio) / size) * size
        const charCode = this.getCharCode(canvas.clientWidth, e.offsetX, e.offsetY)


        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.image, 0, 0);
        
        canvas.style.cursor='default'
        if (!blockedChars.includes(charCode)) {
          canvas.style.cursor='pointer'
          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.fillRect(x, y, size, size); 
        }
      }
    }
  },
  mounted() {
    const canvas = this.$refs["the-canvas"]
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');

        //Loading of the home test image - img1
        var charset = new Image();

        //drawing of the test image - img1
        charset.onload = () => {
            //draw background image
            this.image = charset
            ctx.drawImage(this.image, 0, 0);
            //draw a box over the top
            // ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
            // ctx.fillRect(0, 0, 500, 500);

        };

        charset.src = '/static/img/charset.png';
    }
  }
}
</script>

<style lang="scss" scoped>
.name-maker {
  display: flex;
  flex-direction: column;
  .buttons {
    .right { 
      float: right;
    }
  }
}
</style>