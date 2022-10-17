import originalMaps from './original'
import hipnotic from './hipnotic'
import rogue from './rogue'

export const Game = {
  Original: 'original',
  Hipnotic: 'hipnotic',
  Rogue: 'rogue',
}

export default [{
  game: Game.Original,
  name: 'Quake',
  mapList: originalMaps
},{
  game: Game.Hipnotic,
  name: 'Mission Pack 1: Scourge of Armagon',
  mapList: hipnotic
},{
  game: Game.Rogue,
  name: 'Mission Pack 2: Dissolution of Eternity',
  mapList: rogue
}]