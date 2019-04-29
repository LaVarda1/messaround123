import axios from 'axios'
const masterServerUrl = 'http://master.netquake.io/api/server'

const state = {
  serverStatuses: [],
  autoRefresh: false
}

const mutationTypes = {
  setServerStatuses: 'setServerStatuses',
  setServerPing: 'setServerPing',
  setAutoRefreshOn: 'setAutoRefreshOn',
  setAutoRefreshOff: 'setAutoRefreshOff'
}

const getters = {
  getServerStatuses: state => state.serverStatuses,
  getAutoRefersh: state => state.autoRefresh
}

const mutations = {
  [mutationTypes.setServerStatuses] (state, serverStatuses) {
    state.serverStatuses = serverStatuses
  },
  [mutationTypes.setServerPing] (state, {serverKey, ping}) {
    state.serverStatuses[serverKey].ping = ping
  },
  [mutationTypes.setAutoRefreshOn] (state) {
    state.autoRefresh = true
  },
  [mutationTypes.setAutoRefreshOff] (state) {
    state.autoRefresh = false
  }
}

const refreshTime = 5000
const pingServer = (hostport) => {
  const url = `http://${hostport}/ping`
  const start = new Date().getTime()
  return axios.get(url, {timeout: 1000})
    .then(() => {
      const end = new Date().getTime()
      return end - start
    })
}

const actions = {
  loadServerStatuses ({commit}) {
    return axios.get(masterServerUrl)
      .then(serverStatuses => {
        commit('setServerStatuses', serverStatuses.data.reduce((agg, server) => {
          // Transforms array into key/value hash with key being host:port
          return {
            ...agg,
            [server.connecthostport]: {
              ping: '..',
              ...server
            }
          }
        }, {}))
      })
  },
  pingAllServers ({commit, getters}) {
    const servers = getters.getServerStatuses || {}

    return Object.keys(servers).map(key => {
      const server = servers[key]
      return pingServer(server.connecthostport)
        .then(time => commit('setServerPing', {serverKey: key, ping: time}))
        .catch(err => commit('setServerPing', {serverKey: key, ping: '??'}))
    })
  },
  refresh ({dispatch}) { 
    return dispatch('loadServerStatuses')
      .then(() => dispatch('pingAllServers'))
  },
  refreshLoop ({dispatch, getters}) {
    const work = getters.getAutoRefersh  ? dispatch('refresh') : Promise.resolve()
    return work.then(() => {
        setTimeout(() => {
          dispatch('refreshLoop')
        }, refreshTime)
      })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
