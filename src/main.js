import Vue from 'vue'
import App from './App.vue'

import store from './store'
import VModal from 'vue-js-modal'
import VueRouter from 'vue-router'


import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import VueClipboard from 'vue-clipboard2'
import VTooltip from 'v-tooltip'
import Multiselect from 'vue-multiselect'
 
import 'vue-multiselect/dist/vue-multiselect.min.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlayCircle,
  faPauseCircle,
  faFastForward,
  faFastBackward,
  faSync,
  faList,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
 

// register globally
Vue.component('clip-loader', ClipLoader)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('multiselect', Multiselect)

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
library.add(faList)
library.add(faTimes)

export const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home'
    },
    {
      path: '/:queueId',
      name: 'queue'
    }
  ]
})

new Vue({
  render: h => h(App),
  store,
  router,
}).$mount('#app')
