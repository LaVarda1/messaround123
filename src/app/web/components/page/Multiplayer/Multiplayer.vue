<template lang="pug">
.multiplayer
  .name-setup 
    .name 
      .name-label Your Name:
      .name-value 
        QuakeText(:value="playerName" :size="14")
        small(v-if="!changeName")
          a(@click="changeName=true") change...
    
    .name-change(v-if="changeName")
      NameMaker(:value="playerName" @done="doneChangingName" @input="setPlayerName($event)")
  table.table(v-if="!changeName" :class="(refreshing ? 'loading' : '')")
    thead
      th Name
      th Connection
      th Location
      th Map
      th Players
      th Ping
      th 
    tbody
      ServerRow(v-for="(server, key) in getServerStatuses" :server="server" @join="join")
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex'
import QuakeText from '../../QuakeText.vue'
import NameMaker from '../../input/NameMaker.vue'
import ServerRow from './ServerRow.vue'

const sharewareMaps = ['start', 'e1m1', 'e1m2', 'e1m3', 'e1m4', 'e1m5', 'e1m6', 'e1m7']

export default {
  data () {
    return {
      refreshing: false,
      changeName: false,
      playersImg: []
    }
  },
  components: {QuakeText, NameMaker, ServerRow},
  computed: {
    ...mapGetters('multiplayer', ['getServerStatuses']),
    ...mapGetters('game', ['getAutoexecValue']),
    playerName () {
      const name = this.getAutoexecValue('name')
      return name ?? 'player'
    }
  },
  watch: {
    getServerStatuses: {
      immediate: true,
      handler (newStatus) {
        this.playersTipImg = []
      }
    }
  },
  methods: {
    ...mapMutations('multiplayer', ['setAutoRefreshOff', 'setAutoRefreshOn']),
    ...mapActions('multiplayer', ['refresh']),
    ...mapActions('game', ['setAutoexecValue']),
    setPlayerName(name) {
      this.setAutoexecValue({name: 'name', value: name})
    },
    join(server) {
      var query = {
        "-connect": `wss://${server.connecthostport}`,
      }
      if (server.game && server.game !== 'id1') {
        query["-game"] = server.game
      }
      this.$router.push({name: 'quake', query})
    },
    doneChangingName(){
      this.changeName = false
    }
  },
  beforeRouteEnter (to, from, next) {
    return next(vm => {
      vm.refreshing = true
      vm.refresh().then(() => {
        vm.refreshing = false
        vm.setAutoRefreshOn()
      })
    })
  },
  beforeRouteLeave (to, from, next) {
    this.setAutoRefreshOff()
    return next()
  }
}
</script>
<style lang="scss">

.players-tooltip {
  padding: .1rem;
  text-align: left;
  font-size: .7rem;
}
</style>
<style lang="scss" scoped>
.name-setup {
  margin-top: 1rem;
  .name {
    display: flex;
    align-items: flex-start;

    .name-value {
      margin-left: 2rem;
    }
  }
  .name-change {
    width: 400px;
  }
}
</style>