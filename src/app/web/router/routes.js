import Home from '../components/page/Home.vue'
import Multiplayer from '../components/page/Multiplayer/Multiplayer.vue'
import Singleplayer from '../components/page/Singleplayer/Singleplayer.vue'

import Setup from '../components/page/Setup/Setup.vue'
import Config from '../components/page/Setup/Config.vue'
import Autoexec from '../components/page/Setup/Autoexec.vue'
import SetupGame from '../components/page/Setup/SetupGame/SetupGame.vue'
import Game from '../components/Game.vue'

import Frontend from '../components/layout/Frontend.vue'

const routes = [
  { 
    path: '/', 
    component: Frontend,
    children: [
      { path: '/', component: Home },
      { name: 'multiplayer', path: '/multiplayer', component: Multiplayer },
      { name: 'singleplayer', path: '/singleplayer', component: Singleplayer },
      { 
        name: 'setup',
        path: '/setup',
        component: Setup,
        children: [
          { name: 'assets', path: 'assets', component: SetupGame },
          { name: 'config', path: 'config', component: Config },
          { name: 'autoexec', path: 'autoexec', component: Autoexec }
        ]
      }
    ]
  },
  { 
    name: 'quake', 
    path: '/quake', 
    component: Game,
    props: true 
  },
]

export default routes