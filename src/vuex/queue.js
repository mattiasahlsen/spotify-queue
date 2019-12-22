import { checkStatus, showErr } from '../lib'
import config from '../config'

export default {
  state: {
    queueId: null,
    loading: false,
  },
  actions: {
    fetchQueueId({ state, commit, dispatch, getters }) {
      commit('loadingQueue', true)
      return fetch(config.server + '/queue/id', getters.serverFetchOptions)
        .then(async resp => {
          if (resp.status === 404) return
          await checkStatus(resp) // should do nothing if no error

          const data = await resp.json()
          if (data.queueId) {
            commit('queueId', data.queueId)
            dispatch('fetchCurrent').catch(showErr)
          }

          return data.queueId
      }).finally(() => commit('loadingQueue', false))
    },
    newQueue({ state, commit, dispatch, getters }) {
      return fetch(config.server + '/newQueue', getters.serverFetchOptions)
        .then(checkStatus).then(async resp => {
          const data = await resp.json()
          commit('queueId', data.queueId)
          return data.queueId
        })
    },
    deleteQueue({ state, commit, dispatch, getters }) {
      return fetch(config.server + '/queue/delete', getters.serverFetchOptions)
        .then(checkStatus).then(() => {
          commit('deleteQueue')
        })
    }
  },
  mutations: {
    queueId(state, id) {
      state.queueId = id
    },
    deleteQueue(state) {
      state.queueId = null
    },
    loadingQueue(state, loading) {
      state.loading = loading
    }
  }
}
