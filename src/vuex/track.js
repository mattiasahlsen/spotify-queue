import { checkStatus, } from '../lib'
import config from '../config'

export default {
  state: {
    currentTrack: null,
    loading: null,
    progress: 0,
  },
  getters: {
    currentTrack: state => state.currentTrack,
    progress: state => state.progress,
  },
  actions: {
    fetchTrackData({ state, commit, dispatch, getters }, trackId) {
      return fetch(config.spotifyServer + '/tracks/' + trackId,
        getters.spotifyFetchOptions).then(checkStatus).then(resp => {
          return resp.json()
      })
    },
    fetchCurrent({ state, commit, dispatch, getters}) {
      return dispatch('fetchTrack', 'current')
    },
    fetchNext({ state, commit, dispatch, getters}) {
      return dispatch('fetchTrack', 'next')
    },
    fetchPrevious({ state, commit, dispatch, getters}) {
      return dispatch('fetchTrack', 'previous')
    },

    fetchTrack({ state, commit, dispatch, getters}, endpoint) {
      const url = config.server + '/queue/' + endpoint
      commit('loadingCurrent', true)
      return fetch(url, getters.serverFetchOptions).then(checkStatus)
        .then(async resp => {
          const data = await resp.json()
          if (data.trackId) {
            const track = await dispatch('fetchTrackData', data.trackId)
            commit('currentTrack', track)
          }
          if (data.progress) {
            commit('progress', data.progress)
          }
          return data.trackId
      }).finally(() => commit('loadingCurrent', false))
    },
  },
  mutations: {
    currentTrack(state, track) {
      state.currentTrack = track
    },
    progress(state, ms) {
      state.progress = ms
    },

    loadingCurrent(state, loading) {
      state.loading = loading
    }
  }
}
