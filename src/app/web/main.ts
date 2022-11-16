import {createApp} from 'vue'
import { createPinia } from 'pinia'
import App from './components/App.vue'
import router from './router'
import tippy from "vue-tippy";
import './scss/style.scss'
import 'tippy.js/dist/tippy.css'

const pinia = createPinia()
const app = createApp(App)


app.use(pinia)
app.use(router)
app.use(tippy)
app.mount('#app')