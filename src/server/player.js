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
    const data = await resp.json()
    const current = getCurrent(queue)

    if (data.item) {
      // on queue
      if (current && data.item.id === current.id) {
        // next song
        if (queue.progress > data.progress_ms) playNext(queue)

        queue.progress = data.progress_ms
        queue.isPlaying = data.is_playing
        queue.onQueue = true
      } else {
        queue.onQueue = false
        queue.isPlaying = false
      }
    } else {
      queue.isPlaying = false
    }

    if (queue.onQueue) {
      const LONG = 5000 // 5s
      const SHORT = 500 // 1s
      const msLeft = data ? (data.item.duration_ms - data.progress_ms) : null
      const refresh = () => fetchCurrentlyPlaying(queue)

      if (msLeft && msLeft < 2 * LONG) {
        setTimeout(refresh, SHORT)
      } else setTimeout(refresh, LONG)

      Object.values(queue.sockets).forEach(socket => {
        socket.emit('status', {
          progress: queue.progress,
          isPlaying: queue.isPlaying,
        })
      })
    }

    return data
  }).catch(err => {
    console.log(err)
  })
}

const play = (queue, options) => {
  const restart = options && options.restart
  const pause = options && options.pause
  const current = getCurrent(queue)

  if (restart) queue.progress = 0
  if (!current && !pause) return

  const url = config.spotifyServer +
    '/me/player/' + (pause ? 'pause' : 'play')
  const body = (pause || (queue.onQueue && !restart)) ? {} : {
    uris: ['spotify:track:' + current.id],
    position_ms: queue.progress,
  }

  return fetch(url, {
    ...fetchOptions(queue),
    method: 'PUT',
    body: pause ? undefined : JSON.stringify(body),
  }).then(checkStatus).then(resp => {
    fetchCurrentlyPlaying(queue)
    return resp
  })
}

const resume = queue => play(queue)
const playNext = queue => {
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
