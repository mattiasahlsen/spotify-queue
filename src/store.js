import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import auth from './vuex/auth'
import queue from './vuex/queue'
import track from './vuex/track'
import player from './vuex/player'
import search from './vuex/search'


const store = new Vuex.Store({
  state: {
    error: null,
  },
  getters: {
    error: state => state.error || ''
  },
  modules: {
    auth,
    queue,
    track,
    player,
    search,
  },
  mutations: {
    error(state, error) {
      if (error.message) state.error = error.message
      else state.error = error
    },
    clearError(state) {
      state.error = null
    },
  }
})

const promises = {}
const dispatch = store.dispatch
store.dispatch = (...args) => {
  // if (args.length > 1) return dispatch.apply(store, args)

  const action = args[0]
  if (promises[action]) return promises[action]

  promises[action] = dispatch.apply(store, args)
    .finally(() => promises[action] = null)

  return promises[action]
}

export default store
