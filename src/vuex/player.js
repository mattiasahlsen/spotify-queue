import { checkStatus, } from '../lib'
import config from '../config'

export default {
  state: {
    currentlyPlaying: null,
  },
  getters: {
    isPlaying: (state, getters) => getters.onQueue &&
      state.currentlyPlaying.is_playing,
    onQueue: (state, getters) => getters.currentTrack && state.currentlyPlaying &&
        (getters.currentTrack.id === state.currentlyPlaying.item.id),
  },
  actions: {
    fetchCurrentlyPlaying({ state, commit, dispatch, getters}) {
      return fetch(config.spotifyServer + '/me/player/currently-playing',
        getters.spotifyFetchOptions
      ).then(checkStatus).then(async resp => {
        if (resp.status === 204) return

        const data = await resp.json()
        commit('currentlyPlaying', data)
        if (getters.onQueue) commit('progress', data.progress_ms)
        return data
      })
    },
    async playNext({ state, commit, dispatch, getters}) {
      await dispatch('fetchNext')
      return dispatch('play', { restart: true })
    },
    async playPrevious({ state, commit, dispatch, getters}) {
      if (getters.progress < 2000) await dispatch('fetchPrevious')
      return dispatch('play', { restart: true })
    },
    async play({ state, commit, dispatch, getters}, options) {
      if (!getters.currentTrack) return

      const restart = options && options.restart
      const pause = options && options.pause

      if (restart) commit('progress', 0)
      else await dispatch('fetchCurrentlyPlaying')

      const url = config.spotifyServer +
        '/me/player/' + (pause ? 'pause' : 'play')
      const body = (getters.onQueue && !restart) ? {} : {
        uris: ['spotify:track:' + getters.currentTrack.id],
        position_ms: getters.progress,
      }

      return fetch(url, {
        ...getters.spotifyFetchOptions,
        method: 'PUT',
        body: JSON.stringify(body),
      }).then(resp => dispatch('fetchCurrentlyPlaying'))
    },
  },
  mutations: {
    currentlyPlaying(state, data) {
      state.currentlyPlaying = data
    },
  }
}
