<template lang="pug">
  .game-container  
    span#progress Starting Quake...
    canvas#mainwindow
    #loading(style="display: none; position: fixed;")
      img(alt="Loading")
      .loading-message(style="color: burlywood; font-family: monospace; font-weight:bold;background: RGBA(0,0,0,.2); padding: 3px 10px; margin-left: -7px;")
</template>

<script>
import Vue from 'vue'
import GameInit from '../../game'

const gameHooks = (vueComp) => ({
  quit: () => vueComp.$emit('quit')
})

export default Vue.extend({
  data() {
    return {
      gameSys: null,
      gameQuit: false
    }
  },
  mounted() {
    this.gameSys = GameInit(this.args, {
      // hooks
      quit: () => {
        this.gameQuit = true
        this.$router.go(-1)
      }
    })
  },
  computed: {
    args () {
      const params = this.$route.query
      return Object.keys(params)
        .map(param => (!!params[param] ? param + ' ' + params[param] : param))
        .join(' ')
    }
  },
  beforeRouteLeave (to, from, next) {
    if (this.gameQuit) {
      return next()
    }
    const answer = window.confirm('Do you really want to leave?')
    if (answer) {
      this.gameSys.quit()
      next()
    } else {
      next(false)
    }
  }
})
</script>

<style>
.game-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
