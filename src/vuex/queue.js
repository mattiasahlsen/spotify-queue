import { checkStatus, showErr, queueUrl, pass } from '../lib'
import config from '../config'
import { router } from '../main'
    

export default {
  state: {
    loading: false,
    notFound: false,

    owner: false,
    accessToken: null,

    addedTracks: [],
  },
  getters: {
    owner: state => state.owner,
  },
  actions: {
    fetchQueue({ state, commit, dispatch, getters }) {
      commit('loadingQueue', true)
      return fetch(queueUrl('/queue/data'), getters.serverFetchOptions)
        .then(resp => {
          if (resp.status === 404) commit('notFound', true)
          else commit('notFound', false)
          return resp
        })
        .then(checkStatus).then(async resp => {
          const data = await resp.json()
          commit('owner', data.owner)
          if (data.accessToken) commit('accessToken', data.accessToken)
          dispatch('fetchCurrent').catch(showErr)
          return data
      }).finally(() => commit('loadingQueue', false))
    },
    newQueue({ state, commit, dispatch, getters }) {
      return fetch(config.server + '/newQueue', getters.serverFetchOptions)
        .then(checkStatus).then(async resp => {
          const data = await resp.json()
          router.push({ name: 'queue', params: { queueId: data.queueId }})
            .catch(err => {
              if (err.name === 'NavigationDuplicated') {
                dispatch('fetchQueue').catch(showErr)
              } else throw err
            })
          return data.queueId
        })
    },
    deleteQueue({ state, commit, dispatch, getters }) {
      return fetch(queueUrl('/queue/delete'), getters.serverFetchOptions)
        .then(checkStatus).then(() => {
          router.push('/')
        })
    },
    addTrack({ state, commit, dispatch, getters }, track) {
      return fetch(queueUrl('/queue/track'), {
        ...getters.serverFetchOptions,
        method: 'POST',
        body: JSON.stringify({ trackId: track.id })
      }).then(checkStatus).then(resp => {
        commit('addTrack', track)
      })
    },
  },
  mutations: {
    loadingQueue(state, loading) {
      state.loading = loading
    },
    addTrack(state, track) {
      state.addedTracks = state.addedTracks.concat([track])
    },
    owner(state, isOwner) {
      state.owner = isOwner
    },
    accessToken(state, token) {
      state.accessToken = token
    },

    notFound(state, notFound) {
      state.notFound = notFound
    },
  }
}
