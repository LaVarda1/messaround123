<template lang="pug">
  .game-container
    template(v-if="showRequiresPak")
      PakLoader(@done="pakUploaded")
    template(v-else)
      h4#progress Starting Quake...
      canvas#mainwindow
      #loading(style="display: none; position: fixed;")
        img(alt="Loading")
        .loading-message(style="color: burlywood; font-family: monospace; font-weight:bold;background: RGBA(0,0,0,.2); padding: 3px 10px; margin-left: -7px;")

</template>

<script>
import Vue from 'vue'
import GameInit from '../../../../game'
import PakLoader from './PakLoader.vue'
import {mapGetters} from 'vuex'

export default Vue.extend({
  data() {
    return {
      gameSys: null,
      showRequiresPak: false,
      isQuot: false,
      onQuit: null,
      quitToPath: ''
    }
  },
  components: {
    PakLoader
  },
  async mounted () {
    this.gameSys = await GameInit(this.args, {
      // hooks
      quit: () => {
        this.isQuit = true
        // Navigating to force clear memory.
        
        window.location.href = this.quitToPath
        // Joe - Originally this is navigate back. 
        // if (this.onQuit) {
        //   this.onQuit()
        // } else {
        //   
        //   // this.$router.go(-1)
        //   window.location.href = this.quitToPath
        // }
      },
      startRequestPak: resolve => {
        this.showRequiresPak = true;
        this.uploadResolve = resolve
      }
    })
  },
  computed: {
    args () {
      const params = this.$route.query
      return Object.keys(params)
        .map(param => (!!params[param] ? param + ' ' + params[param] : param))
        .join(' ')
    },
    ...mapGetters('game', ['allAssetMetas']),
    pak1 () { 
      return this.allAssetMetas.filter(assetMeta => 
        assetMeta.game === 'id1' && assetMeta.fileName.toLowerCase() === 'pak1.pak') 
    }
  },
  methods: {
    pakUploaded () {
      this.showRequiresPak = false
      this.uploadResolve()
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.quitToPath = from.path
    })
  },
  beforeRouteLeave (to, from, next) {
    if (this.isQuit) {
      return next()
    }
    const answer = window.confirm('Do you really want to leave?')
    if (answer) {
      this.onQuit = next
      this.gameSys.quit()
    } else {
      next(false)
    }
  }
})
</script>

<style lang="scss">
.game-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

#lateregistered {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items:center;
  justify-content: center;
  .uploader {
    width: 80%;
  }
}
#progress {
  margin-top: 2rem;
  text-align: center;
}
</style>
