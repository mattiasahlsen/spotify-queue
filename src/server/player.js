const fetch = require('node-fetch')
const config = require('./config')
const queryString = require('querystring')

const {
  fetchOptions,

  checkStatus
} = require('./lib')

const {
} = config

const {
  getPrevious,
  getCurrent,
  getNext
} = require('./queue')

let fetchCurrentlyPlaying
fetchCurrentlyPlaying = queue => {
  return fetch(config.spotifyServer + '/me/player',
    fetchOptions(queue)
  ).then(checkStatus).then(async resp => {
    const LONG = 5000 // 5s
    const SHORT = 500 // 1s
    const refresh = () => fetchCurrentlyPlaying(queue)
    const current = getCurrent(queue)
    let data

    try {
      data = await resp.json()
    } catch (err) {
      queue.isPlaying = false
      queue.onQueue = false
      return setTimeout(refresh, LONG)
    }
    if (!data.item) {
      queue.isPlaying = false
      queue.onQueue = false
      return setTimeout(refresh, LONG)
    }


    // on queue
    if (current && data.item.id === current.id) {
      // next song
      if (queue.progress > data.progress_ms &&
        data.progress_ms === 0 &&
        !data.is_playing
      ) {
        playNext(queue)
      }

      queue.progress = data.progress_ms
      queue.isPlaying = data.is_playing
      queue.onQueue = true
    } else {
      queue.onQueue = false
      queue.isPlaying = false
    }

    Object.values(queue.sockets).forEach(socket => {
      socket.emit('status', {
        progress: queue.progress,
        isPlaying: queue.isPlaying,
      })
    })

    if (queue.onQueue) {
      const msLeft = data.item.duration_ms - data.progress_ms
      if (msLeft && msLeft < 2 * LONG) setTimeout(refresh, SHORT)
      else setTimeout(refresh, LONG)
    }

    return data
  }).catch(err => {
    console.log(err)
  })
}

const play = async (queue, options) => {
  const restart = options && options.restart
  const pause = options && options.pause
  const current = getCurrent(queue)

  if (restart) queue.progress = 0
  if (!current && !pause) return

  let url = config.spotifyServer +
    '/me/player/' + (pause ? 'pause' : 'play') 
  if (queue.deviceId) url += '?' + queryString.stringify({
    device_id: queue.deviceId
  })

  const body = (pause || (queue.onQueue && !restart)) ? {} : {
    uris: ['spotify:track:' + current.id],
    position_ms: queue.progress,
  }

  return fetch(url, {
    ...fetchOptions(queue),
    method: 'PUT',
    body: pause ? undefined : JSON.stringify(body),
  }).then(checkStatus)
    .catch(async err => {
      if (err.status === 403) return err.resp
      if (err.status === 404) {
        const data = await err.resp.json()
        if (data.error.reason === 'NO_ACTIVE_DEVICE') {
          err.clientMessage = 'Couldn\'t find device.'
        }
        throw err
      }
    })
    .then(resp => {
      Object.values(queue.sockets).forEach(socket => socket.emit('current', {
        track: current,
        progress: queue.progress
      }))
      fetchCurrentlyPlaying(queue)
      return resp
    })
}

const resume = queue => play(queue)
const playNext = async queue => {
  if (!getCurrent(queue)) return
  return getNext(queue).then(track => play(queue, {
    pause: !track,
    restart: true
  }))
}
const playPrevious = queue => {
  if (queue.progress < 3000) getPrevious(queue)
  return play(queue, { restart: true })
}

const pause = queue => play(queue, { pause: true })

module.exports = {
  resume,
  playNext,
  playPrevious,
  pause,
}
