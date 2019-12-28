import { checkStatus, showErr, queueUrl } from '../lib'
import config from '../config'

export default {
  state: {
    isPlaying: false,
    progress: 0,
    liveProgress: 0,

    deviceId: null,
    deviceError: null
  },
  getters: {
    isPlaying: state => state.isPlaying,
    progress: state => state.progress,
    liveProgress: state => state.liveProgress,
  },
  actions: {
    async playNext({ state, commit, dispatch, getters}) {
      return dispatch('control', 'next')
    },
    async playPrevious({ state, commit, dispatch, getters}) {
      return dispatch('control', 'previous')
    },
    async pause({ state, commit, dispatch, getters}) {
      return dispatch('control', 'pause')
    },
    async resume({ state, commit, dispatch, getters}) {
      return dispatch('control', 'resume')
    },
    async control({ state, commit, dispatch, getters}, endpoint) {
      if (!state.deviceId) return commit('deviceError', 'No selected device')

      const path = '/spotify/' + endpoint
      return fetch(queueUrl(path), {
        ...getters.serverFetchOptions,
      }).then(checkStatus)
    },
  },
  mutations: {
    isPlaying(state, isPlaying) {
      state.isPlaying = isPlaying
    },
    progress(state, ms) {
      state.progress = ms
      state.liveProgress = ms
    },
    liveProgress(state, ms) {
      state.liveProgress = ms
    },

    deviceId(state, id) {
      state.deviceId = id
    },

    deviceError(state, msg) {
      state.deviceError = msg
    }
  }
}
