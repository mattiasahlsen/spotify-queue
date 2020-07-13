const fetch = require('node-fetch')
const config = require('./config')
const { log, logErr } = require('./logger')

const {
  queueIdKey,
  spotifyServer
} = require('./config')
const {
  generateRandomString,

  fetchOptions,
  checkStatus,
  myFetch,

  error,
  requireAuth,
} = require('./lib')

const queues = {}

const trackData = (id, queue) => {
  const fetchTrack = () => {
    return fetch(spotifyServer + '/tracks/' + id,
      fetchOptions(queue)
    )
  }

  return myFetch(fetchTrack, queue)
    .then(checkStatus)
    .then(resp => resp.json())
    .catch(err => {
      logErr(err)
      return res.status(500).end()
    })
}

const newQueue = (ownerId, accessToken, refreshToken) => {
  const queueId = generateRandomString(32)

  const queue = {
    id: queueId,
    accessToken,
    refreshToken,
    owner: ownerId,
    deviceId: null,

    users: {},
    played: [],
    index: 0,

    progress: 0,
    isPlaying: false,

    sockets: {},

    isRefreshing: false,
  }
  queues[queueId] = queue
  setTimeout(() => {
    delete queues[queueId]
  }, 1000 * 3600 * 48) // delete after 48 hours

  return queueId
}

const getPrevious = queue => {
  queue.progress = 0
  if (queue.index === 0) return queue.played[0]
  queue.index--
  const track = queue.played[queue.index]

  return track
}

const getCurrent = queue => {
  const track = queue.played[queue.index]
  return track
}

const getNext = async queue => {
  queue.progress = 0
  if (queue.index < queue.played.length) queue.index++
  if (queue.index < queue.played.length) return queue.played[queue.index]

  const userQueues = Object.values(queue.users).filter(queue => queue.length > 0)
  if (userQueues.length === 0) return null

  const userQueue = userQueues[Math.floor(Math.random() * userQueues.length)]

  const track = await trackData(userQueue[0], queue)
  userQueue.shift() // success

  queue.played.push(track)
  return track
}
const seeNext = async queue => {
  if (queue.index < queue.played.length - 1) return queue.played[queue.index + 1]

  const userQueues = Object.values(queue.users).filter(queue => queue.length > 0)
  if (userQueues.length === 0) return null

  const userQueue = userQueues[Math.floor(Math.random() * userQueues.length)]

  const track = await trackData(userQueue[0], queue)
  userQueue.shift() // success

  queue.played.push(track)
  return track
}

const requireQueue = (req, res, next) => {
  requireAuth(req, res, () => {
    const queueId = req.query.queueId
    if (!queueId) return res.status(400).json(error('No queue id specified.'))

    const queue = queues[queueId]
    if (!queue) {
      res.clearCookie(queueIdKey)
      return res.status(404).json(error('Queue not found.'))
    }

    req.queueId = queueId
    req.queue = queue

    req.owner = (queue.owner === req.userId)

    next()
  })
}

module.exports = {
  queues,
  requireQueue,

  newQueue,
  getPrevious,
  getCurrent,
  getNext,
  seeNext,
}
