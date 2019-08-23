<template lang="pug">
  .game-container
    #lateregistered(v-if="showUpload")
      .uploader
        H3 You must load the original Pak1.pak to play registered games
        a(href="/") Nevermind, take me back.
        Id1Assets(@uploaded="pakUploaded")
    tempalte(v-else)
      h4#progress Starting Quake...
      canvas#mainwindow
      #loading(style="display: none; position: fixed;")
        img(alt="Loading")
        .loading-message(style="color: burlywood; font-family: monospace; font-weight:bold;background: RGBA(0,0,0,.2); padding: 3px 10px; margin-left: -7px;")

</template>

<script>
import Vue from 'vue'
import GameInit from '../../game'
import Id1Assets from '../components/page/Setup/SetupGame/ID1Assets.vue'
import {mapGetters} from 'vuex'

export default Vue.extend({
  data() {
    return {
      gameSys: null,
      gameQuit: false,
      uploadPromise: null,
      showUpload: false
    }
  },
  components: {
    Id1Assets
  },
  mounted() {
    this.gameSys = GameInit(this.args, {
      // hooks
      quit: () => {
        this.gameQuit = true
        this.$router.go(-1)
      },
      startRequestPak: resolve => {
        this.showUpload = true;
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
    pakUploaded (files) {
      if (files.some(f => f.toLowerCase() === 'pak1.pak')) {
        this.showUpload = false
        this.uploadResolve()
      }
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
