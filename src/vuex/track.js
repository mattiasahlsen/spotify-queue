import { checkStatus, queueUrl } from '../lib'
import config from '../config'

export default {
  state: {
    currentTrack: null,
    loading: null,
  },
  getters: {
    currentTrack: state => state.currentTrack,
  },
  actions: {
    fetchTrackData({ state, commit, dispatch, getters }, trackId) {
      return fetch(queueUrl('/spotify/track/' + trackId),
        getters.serverFetchOptions).then(checkStatus).then(resp => {
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
      const path = '/queue/' + endpoint
      commit('loadingCurrent', true)
      return fetch(queueUrl(path), getters.serverFetchOptions).then(checkStatus)
        .then(async resp => {
          const data = await resp.json()
          if (data.trackData) {
            commit('currentTrack', data.trackData)
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
    }
  }
}
