<template lang="pug">
tr
  td {{server.name}}
  td {{server.connecthostport}}
  td {{server.location}}
  td {{server.map}}
  td(v-if="server.players.length"
    v-tippy="{allowHTML: true}"
    :content="playerTooltipHtml")  {{formatPlayerCount}}
  td(v-else)  {{formatPlayerCount}}
  td {{server.ping}}
  td
    button.btn.tooltip.tooltip-left(@click="$emit('join', server)" :disabled="isDisabled(server)" :data-tooltip="joinToolTipText(server)") Join

</template>

<script>
import { createWriter } from "../../../helpers/charmap"
import {mapGetters} from 'vuex'
export default {
  props: {
    server: {
      type: Object,
      requried: true
    }
  },
  data() {
    return {
      playerTooltipHtml: ''
    }
  },
  computed: {
    ...mapGetters('game', ['hasRegistered','getAutoexecValue']),
    formatPlayerCount () {
      return `${this.server.players.length}/${this.server.maxPlayers}`
    },
  },

  watch:{
    server: {
      handler() {
        createWriter()
          .then(writer => {
            const body = [...this.server.players]
              .sort((a, b) => b.currentFrags - a.currentFrags)
              .map((player) => {
                return `<tr style="line-height: 1;">
                <td style="text-align:right;">
                  <img src="${writer.writeScore(14, player.frags, (player.colors & 0xf0) >> 4, player.colors & 0xf)}" style="display:inline;">
                </td>
                <td style="padding-left: 1rem; text-align: left">
                  <img src="${writer.write(12, btoa(player.name))}" style="display:inline;">
                </td>
                </tr>`;
              })
              .join('');

            this.playerTooltipHtml = `<table><tbody>${body}</tbody></table>`;
          })
      },
      immediate: true
    }
  },
  methods: {
    // playersToolTipText (server) {
    //   const players = server.players
    //   players.sort((a, b) => parseInt(b.frags) - parseInt(a.frags))
    //   return players.reduce((str, player) => {
    //     return str += player.frags + "\t\t" + player.name + '\n'
    //   }, "Online Players\nFrags\tName\n")
    // },
    // playersImageToolTipText (server) {
    //   const playersImg = this.playersTipImg.find(test => test.server.name === server.name)
    //   return `<div class="players-tooltip"><img src="${playersImg.img}"></div>`
    // },
    isDisabled (server) {
      return !this.hasRegistered && !sharewareMaps.find(m => m === server.map)
    },
    joinToolTipText (server) {
      return this.isDisabled(server) ? "Must add registered assets in setup\n before joining this server" : "Join this game server"
    },

  }
}
</script>