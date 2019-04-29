import Vuex from 'vuex'
import Vue from 'vue'
import player from './player'
import game from './game'
import multiplayer from './multiplayer'
Vue.use(Vuex)


const store = new Vuex.Store({
  modules: {
    multiplayer,
    player,
    game
  },
})

store.dispatch('game/loadConfig')
if (!store.getters['game/getConfigFile']) {
  store.dispatch('game/loadRecommendedConfig')
}

store.dispatch('game/loadAutoexec')
if (!store.getters['game/getAutoexecFile']) {
  store.dispatch('game/loadRecommendedAutoexec')
}
store.dispatch('game/loadAssets')
store.dispatch('multiplayer/refreshLoop')

export default store