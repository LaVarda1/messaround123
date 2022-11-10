import {createApp} from 'vue'
import App from './components/App.vue'
import store from './stores'
import router from './router'
import VueTippy, { TippyComponent, useTippyComponent } from "vue-tippy";
import './scss/style.scss'

/* eslint-disable no-new */
const app = createApp(App)

app.use(router)
app.use(VueTippy)

app.component('tippy', useTippyComponent())

app.mount('#app')