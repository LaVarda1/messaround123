import {createRouter, createWebHistory} from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router