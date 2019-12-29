import config from '../config'

import { checkStatus, newError, showErr } from '../lib'

export default {
  state: {
    authorized: false,
    userId: null,
  },
  getters: {
    serverFetchOptions: state => ({
      credentials: 'include',
      headers: { 'Content-type': 'application/json' }
    }),
    spotifyFetchOptions: (state, getters, rootState, rootGetters) => ({
      headers: {
        'Authorization': 'Bearer ' + rootGetters.queueAccessToken
      }
    }),
    authorized: state => state.authorized,
  },
  actions: {
    authenticate({ state, commit, getters, dispatch }) {
      return fetch(config.server + '/authenticate', getters.serverFetchOptions)
        .then(checkStatus).then(async resp => {
          const data = await resp.json()
          commit('userId', data.userId)
          commit('authorized', data.authorized)
          return data
        })
    },
    logout({ state, commit, getters }) {
      return fetch(config.server + '/logout', getters.serverFetchOptions)
        .then(checkStatus).then(resp => {
          commit('authorized', false)
          commit('owner', false)
          commit('userId', null)
        })
    },
  },
  mutations: {
    authorized(state, authorized) {
      state.authorized = authorized
    },
    userId(state, userId) {
      state.userId = userId
    },
  }
}