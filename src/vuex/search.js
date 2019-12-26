import { checkStatus, queueId } from '../lib'
import config from '../config'
import querystring from 'querystring'

export default {
  state: {
    tracks: null,
    loading: false,
  },
  getters: {
  },
  actions: {
    searchTracks({ state, commit, dispatch, getters}, q) {
      commit('loadingTracks', true)

      return fetch(config.server + '/spotify/search?' +
        querystring.stringify({ q, queueId: queueId() }),
        getters.serverFetchOptions
      ).then(checkStatus).then(async resp => {
        const data = await resp.json()
        commit('tracks', data.tracks.items)
        return data
      }).finally(() => commit('loadingTracks', false))
    },
  },
  mutations: {
    tracks(state, tracks) {
      state.tracks = tracks
    },
    loadingTracks(state, loading) {
      state.loading = loading
    },
  }
}
