import Vue from 'vue'
import App from './App.vue'

import store from './store'
import VModal from 'vue-js-modal'
import VueRouter from 'vue-router'


import VueClipboard from 'vue-clipboard2'
import VTooltip from 'v-tooltip'
 

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlayCircle,
  faPauseCircle,
  faFastForward,
  faFastBackward,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
 
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VModal, { dialog: true })
Vue.use(VueClipboard)
Vue.use(VTooltip)
Vue.use(VueRouter)

Vue.config.productionTip = false

library.add(faPlayCircle)
library.add(faPauseCircle)
library.add(faFastForward)
library.add(faFastBackward)
library.add(faSync)

export const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/:queueId',
      name: 'home'
    }
  ]
})

new Vue({
  render: h => h(App),
  store,
  router,
}).$mount('#app')
