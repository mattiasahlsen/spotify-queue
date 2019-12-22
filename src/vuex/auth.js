import config from '../config'

import { checkStatus, newError, showErr } from '../lib'

export default {
  state: {
    accessToken: null,
    userData: null,

    loading: false,
  },
  getters: {
    serverFetchOptions: state => ({
      credentials: 'include',
      headers: { 'Content-type': 'application/json' }
    }),
    spotifyFetchOptions: state => ({
      headers: {
        'Authorization': 'Bearer ' + state.accessToken
      }
    })
  },
  actions: {
    refreshAccessToken({ dispatch }) {
      return dispatch('fetchAccessToken', true)
    },
    fetchAccessToken({ state, commit, getters, dispatch }, refresh) {
      commit('loadingToken', true)
      return fetch(
        config.server + (refresh ? '/refreshToken' : '/accessToken'),
        getters.serverFetchOptions
      ).then(checkStatus).then(async resp => {
        const data = await resp.json()
        if (data.accessToken) {
          commit('accessToken', data.accessToken)
          dispatch('fetchUserData').catch(showErr)
        }
        return state.accessToken
      }).finally(() => commit('loadingToken', false))
    },
    logout({ state, commit, getters }) {
      return fetch(config.server + '/logout', getters.serverFetchOptions)
        .then(checkStatus).then(resp => {
          commit('accessToken', null)
        })
    },

    fetchUserData({ commit, dispatch, state, getters }) {
      return fetch(config.spotifyServer + '/me', getters.spotifyFetchOptions)
        .then(async resp => {
          if (resp.status === 200) {
            const data = await resp.json()
            commit('userData', data)
          } else if (resp.status === 401) {
            return dispatch('refreshAccessToken').then(dispatch('fetchUserData'))
          } else throw new Error('HTTP status: ' + resp.status)
      })
    },
  },
  mutations: {
    accessToken(state, token) {
      state.accessToken = token
    },
    userData(state, data) {
      state.userData = data
    },

    loadingToken(state, loading) {
      state.loading = loading
    }
  }
}