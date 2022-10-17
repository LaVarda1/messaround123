import Vue from 'vue'
import App from './components/App.vue'
import store from './store'
import router from './router'
import VueTippy, { TippyComponent } from "vue-tippy";
import './scss/style.scss'

Vue.use(VueTippy);
Vue.component("tippy", TippyComponent);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  store,
  router
})
