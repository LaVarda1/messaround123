<template lang="pug">
tr
  td {{props.server.name}}
  td {{props.server.location}}
  td {{props.server.map}}
  td(v-if="props.server.players.length"
    v-tippy="{allowHTML: true}"
    :content="model.playerTooltipHtml")  {{formatPlayerCount}}
  td(v-else)  {{formatPlayerCount}}
  td {{props.server.ping}}
  td
    QButton(
      @click="emit('join', props.server)" 
      :disabled="isDisabled" 
      :tooltipPlacement="TooltipPlacement.left"
      :tooltip="joinTooltipText"
    ) Join

</template>

<script lang="ts" setup>
import {reactive, onMounted, computed, watch, defineProps} from 'vue'
import { createWriter } from "../../../helpers/charmap"
import { useGameStore } from '../../../stores/game';
import QButton, {TooltipPlacement, ButtonType} from '../../input/QButton.vue'
import type { ServerStatus } from '../../../stores/multiplayer';

const emit = defineEmits<{
  (e: 'join', server: ServerStatus): void}
>()

const gameStore = useGameStore()
const sharewareMaps = ['start', 'e1m1', 'e1m2', 'e1m3', 'e1m4', 'e1m5', 'e1m6', 'e1m7', 'e1m8']

const props = defineProps<{server: ServerStatus}>()
const model = reactive<{playerTooltipHtml}>({playerTooltipHtml: ''})
const formatPlayerCount = computed(() => `${props.server.players.length}/${props.server.maxPlayers}`)
const isDisabled = computed(() => !gameStore.hasRegistered && !sharewareMaps.find(m => m === props.server.map))
const joinTooltipText = computed(() => isDisabled.value ? "You must load your pak1.pak before playing modified games.\n See FAQ for details." : "Join this game server")

watch(props, () => {
  createWriter()
    .then(writer => {
      const body = [...props.server.players]
        .sort((a, b) => parseInt(b.frags) - parseInt(a.frags))
        .map((player) => {
          return `<tr style="line-height: 1;">
          <td style="text-align:right;">
            <img src="${writer.writeScore(14, parseInt(player.frags), (player.colors & 0xf0) >> 4, player.colors & 0xf)}" style="display:inline;">
          </td>
          <td style="padding-left: 1rem; text-align: left">
            <img src="${writer.write(12, btoa(player.name))}" style="display:inline;">
          </td>
          </tr>`;
        })
        .join('');

      model.playerTooltipHtml = `<table><tbody>${body}</tbody></table>`;
    })
}, {immediate: true})
</script>