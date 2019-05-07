<template lang="pug">
  .multiplayer
    table.table(:class="(refreshing ? 'loading' : '')")
      thead
        th Name
        th Connection
        th Location
        th Map
        th Players
        th Ping
        th 
      tbody
        tr(v-for="(server, key) in getServerStatuses")
          td {{server.name}}
          td {{server.connecthostport}}
          td {{server.location}}
          td {{server.map}}
          td {{formatPlayerCount(server)}}
          td {{server.ping}}
          td
            button.btn.tooltip.tooltip-left(@click="join(server)" :disabled="isDisabled(server)" :data-tooltip="tooltipText(server)") Join
        
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex'
const sharewareMaps = ['start', 'e1m1', 'e1m2', 'e1m3', 'e1m4', 'e1m5', 'e1m6', 'e1m7']
export default {
  data () {
    return {
      refreshing: false
    }
  },
  computed: {
    ...mapGetters('multiplayer', ['getServerStatuses']),
    ...mapGetters('game', ['hasRegistered'])
  },
  methods: {
    ...mapMutations('multiplayer', ['setAutoRefreshOff', 'setAutoRefreshOn']),
    ...mapActions('multiplayer', ['refresh']),
    join(server) {
      var query = {
        "-connect": `ws://${server.connecthostport}`,
      }
      if (server.game) {
        query["-game"] = server.game
      }
      this.$router.push({name: 'quake', query})
    },
    formatPlayerCount (server) {
      return `${server.players.length}/${server.maxPlayers}`
    },
    isDisabled (server) {
      return !this.hasRegistered && !sharewareMaps.find(m => m === server.map)
    },
    tooltipText (server) {
      return this.isDisabled(server) ? "Must add registered assets in setup\n before joining this server" : "Join this game server"
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
