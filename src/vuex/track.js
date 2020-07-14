import { checkStatus, queueUrl } from '../lib'
import config from '../config'

export default {
  state: {
    currentTrack: null,
    loading: false,

    nextTrack: null,
    comingUp: null,
  },
  getters: {
    currentTrack: state => state.currentTrack,
  },
  actions: {
    fetchCurrent({ state, commit, dispatch, getters}) {
      const path = '/queue/current'
      commit('loadingCurrent', true)
      return fetch(queueUrl(path), getters.serverFetchOptions).then(checkStatus)
        .then(async resp => {
          const data = await resp.json()
          if (data.trackData) {
            commit('currentTrack', data.trackData)
            commit('progress', data.progress)
            commit('isPlaying', data.isPlaying)
          } else commit('currentTrack', null)
          return data
      })
      .finally(() => commit('loadingCurrent', false))
    },
  },
  mutations: {
    currentTrack(state, track) {
      state.currentTrack = track
    },
    loadingCurrent(state, loading) {
      state.loading = loading
    },

    nextTrack(state, track) {
      state.nextTrack = track
    },
    comingUp(state, tracks) {
      state.comingUp = tracks
    }
  }
}
