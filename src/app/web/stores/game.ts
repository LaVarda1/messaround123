  import * as indexedDb from '../../../shared/indexeddb'
import { defineStore } from 'pinia'
import { AssetMeta } from '../../../shared/types/Store'

const recommendedCfg = 
`bind "TAB" "+showscores"
bind "ENTER" "messagemode"
bind "ESCAPE" "togglemenu"
bind "SPACE" "+jump"
bind "+" "sizeup"
bind "," "+moveleft"
bind "-" "sizedown"
bind "." "+moveright"
bind "/" "impulse 10"
bind "0" "impulse 0"
bind "1" "impulse 1"
bind "2" "impulse 2"
bind "3" "impulse 3"
bind "4" "impulse 4"
bind "5" "impulse 5"
bind "6" "impulse 6"
bind "7" "impulse 7"
bind "8" "impulse 8"
bind "=" "sizeup"
bind "\\" "+mlook"
bind "\`" "toggleconsole"
bind "a" "+lookup"
bind "c" "+movedown"
bind "d" "+moveup"
bind "t" "messagemode"
bind "z" "+lookdown"
bind "~" "toggleconsole"
bind "w" "+forward"
bind "s" "+back"
bind "a" "+moveleft"
bind "d" "+moveright"
bind "UPARROW" "+forward"
bind "DOWNARROW" "+back"
bind "LEFTARROW" "+left"
bind "RIGHTARROW" "+right"
bind "ALT" "+strafe"
bind "CTRL" "+attack"
bind "SHIFT" "+speed"
bind "F1" "help"
bind "F2" "menu_save"
bind "F3" "menu_load"
bind "F4" "menu_options"
bind "F5" "menu_multiplayer"
bind "F6" "echo Quicksaving...; wait; save quick"
bind "F9" "echo Quickloading...; wait; load quick"
bind "F10" "quit"
bind "F11" "zoom_in"
bind "F12" "screenshot"
bind "INS" "+klook"
bind "DEL" "+lookdown"
bind "PGDN" "+lookup"
bind "END" "centerview"
bind "MOUSE1" "+attack"
bind "MOUSE2" "+jump"
bind "PAUSE" "pause"
crosshair "1"
gamma "0.7"
savedgamecfg "0"
saved1 "0"
saved2 "0"
saved3 "0"
saved4 "0"
viewsize "100"
volume "0.7"
bgmvolume "1"
_cl_name "player"
_cl_color "0"
cl_forwardspeed "400"
cl_backspeed "400"
lookspring "0"
lookstrafe "0"
sensitivity "3"
m_filter "1"
m_pitch "0.022"
m_yaw "0.022"
m_forward "1"
m_side "0.8"`

const recommendedAutoexec = `+mlook
bind e "impulse 22" // Hook
`

const configValueRx = (name) => `^([ \t]*${name}[ \t]+"?(.*?)"?)$`
const configFileName = 'Quake.id1/config.cfg'
const autoExecFileName = 'Quake.id1/autoexec.cfg'

interface State {
  assetMetas: AssetMeta[],
  configFile: string
  autoexecFile: string
  newGameType: string
}


const getters = {
  allAssetMetas: (state: State) => state.assetMetas,
  getConfigFile: (state: State) => state.configFile,
  getAutoexecFile: (state: State) => state.autoexecFile,
  getAutoexecValue: (state: State) => name =>  {
    const regex =  new RegExp(configValueRx(name), 'gim')
    let match, m
    while ((m = regex.exec(state.autoexecFile)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      match = m
    }
    
    return match ? match[2] : null
  },
  hasRegistered: (state: State) => !!state.assetMetas.find(a => a.game === 'id1' && a.fileName.toLowerCase() === 'pak1.pak'),
  hasGame: (state: State) => game => !!state.assetMetas.some(a => a.game === game)
}

const actions = {
  setAssetMetas (assetMetas: AssetMeta[]) {
    this.assetMetas = assetMetas
  },
  setConfigFile (configFile: string) {
    this.configFile = configFile || ''
  },
  setAutoexecFile (autoexecFile: string) {
    this.autoexecFile = autoexecFile || ''
  },
  loadConfig () {
    const configFile = localStorage[configFileName]
    this.setConfigFile(configFile)
  },
  saveConfig (configFile) {
    localStorage[configFileName] = configFile
    this.setConfigFile(configFile)
  },
  loadRecommendedConfig () {
    localStorage[configFileName] = recommendedCfg
    this.setConfigFile(recommendedCfg)
  },
  loadAutoexec () {
    const autoexecFile = localStorage[autoExecFileName]
    this.setAutoexecFile(autoexecFile)
  },
  saveAutoexec (autoexecFile) {
    localStorage[autoExecFileName] = autoexecFile
    this.setAutoexecFile(autoexecFile)
  },
  setAutoexecValue (autoexecNameValue) {
    const regex =  new RegExp(configValueRx(autoexecNameValue.name), 'gim')
    let match, m
    while ((m = regex.exec(this.autoexecFile)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      match = m
    }
    const newSetting = `${autoexecNameValue.name} "${autoexecNameValue.value}"`
    if (match) {
      const newConfig = [
        this.autoexecFile.substring(0,match.index),
        newSetting,
        this.autoexecFile.substring(match.index + match[0].length, this.autoexecFile.length)
      ]
      return this.saveAutoexec(newConfig.join(''))
    } else {
      return this.saveAutoexec(this.autoexecFile +'\n' + newSetting)
    }
  },
  loadRecommendedAutoexec () {
    localStorage[autoExecFileName] = recommendedAutoexec
    this.setAutoexecFile(recommendedAutoexec)
  },
  loadAssets () {
    return indexedDb.getAllMeta()
      .then(allAssets => {
        this.setAssetMetas(allAssets)
      })
  },
  saveAsset ({game, fileName, fileCount, data}) {
    return indexedDb.saveAsset(game, fileName, fileCount, data)
      .then(() => this.loadAssets())
  },
  removeAsset (assetId) {
    return indexedDb.removeAsset(assetId)
      .then(() => this.loadAssets())
  }
}


export const useGameStore = defineStore('game', {
  state: (): State => ({
    assetMetas: [],
    configFile: '',
    autoexecFile: '',
    newGameType: ''
  }),
  getters,
  actions
})