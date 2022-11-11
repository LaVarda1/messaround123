<template lang="pug">
.multiplayer
  .name-setup 
    .name 
      .name-label Your Name:
      .name-value 
        QuakeText(:value="playerName" :size="14")
        small(v-if="!model.changeName")
          a(@click="model.changeName=true") change...
    
    .name-change(v-if="model.changeName")
      NameMaker(:value="playerName" @done="doneChangingName" @input="setPlayerName($event)")
  .server-list(v-if="!model.changeName")
    table.table(:class="(model.refreshing ? 'loading' : '')")
      thead
        th Name
        th Location
        th Map
        th Players
        th Ping
        th 
      tbody
        ServerRow(v-for="(server, key) in multiplayerStore.getServerStatuses" :server="server" @join="join")
  Discord
</template>

<script lang="ts">
import { defineComponent, ComponentPublicInstance } from 'vue'
import { useMultiplayerStore } from '../../../stores/multiplayer'

const multiplayerStore = useMultiplayerStore()
interface IInstance extends ComponentPublicInstance {
  refreshing: boolean,
  refresh: () => Promise<void>,
  setAutoRefreshOn: () => void
}
export default defineComponent({
  beforeRouteEnter(to, from, next) {
    return next(vm => {
      const instance = vm as IInstance
      instance.refreshing = true
      instance.refresh().then(() => {
        instance.refreshing = false
        multiplayerStore.setAutoRefreshOn()
      })
    })
  }
})
</script>
<script lang="ts" setup>
import {reactive, onMounted, computed, watch, defineProps, ref} from 'vue'
import QuakeText from '../../QuakeText.vue'
import NameMaker from '../../input/NameMaker.vue'
import ServerRow from './ServerRow.vue'
import Discord from './Discord.vue'
import { useGameStore } from '../../../stores/game'
import { ServerStatus } from '../../../stores/multiplayer'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const router = useRouter()
const multiplayerStore = useMultiplayerStore()
const gameStore = useGameStore()
const model = reactive<{
  refreshing: boolean,
  changeName: boolean,
  playersImg: any[]
}>({
  refreshing: false,
  changeName: false,
  playersImg: []
})

// watch(multiplayerStore.getServerStatuses, () => {
//   playersTipImg = []
// }, {immediate: true})

const playerName = computed(() => gameStore.getAutoexecValue('name') ?? 'player')
const setPlayerName = (name: string) => gameStore.setAutoexecValue({name: 'name', value: name})
const join = (server: ServerStatus) => {
  var query = {
    "-connect": `wss://${server.connecthostport}`,
  }
  if (server.game && server.game !== 'id1') {
    query["-game"] = server.game
  }
  router.push({name: 'quake', query})
}
const doneChangingName = () => model.changeName = false

onBeforeRouteLeave((to, from, next) => {
  multiplayerStore.setAutoRefreshOff()
  return next()
})
</script>
<style lang="scss">

.players-tooltip {
  padding: .1rem;
  text-align: left;
  font-size: .7rem;
}
</style>
<style lang="scss" scoped>
.server-list {
  margin-bottom: 1rem;
}
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