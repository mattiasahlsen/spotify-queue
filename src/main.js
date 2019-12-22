import Vue from 'vue'
import App from './App.vue'

import store from './store'
import VModal from 'vue-js-modal'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlayCircle,
  faPauseCircle,
  faFastForward,
  faFastBackward,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
 
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VModal, { dialog: true })

Vue.config.productionTip = false

library.add(faPlayCircle)
library.add(faPauseCircle)
library.add(faFastForward)
library.add(faFastBackward)

new Vue({
  render: h => h(App),
  store,
}).$mount('#app')
