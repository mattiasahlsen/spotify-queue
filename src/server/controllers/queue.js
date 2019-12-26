const express = require('express')
const fetch = require('node-fetch')
const config = require('../config')
const queryString = require('querystring')

const router = express.Router()

const {
  generateRandomString,
  error,
} = require('../lib')
const {
  queues,
  requireQueue,

  newQueue,
  getPrevious,
  getCurrent,
  getNext,
} = require('../queue')

const {
  userIdKey,
  accessTokenKey,
  refreshTokenKey,
} = config


const testTracks = [
  '7KT7VGnPU5QVXN3q1BOeqb', // higher ground,
  '63yesoRJgXT5QALryYFV0X', // boy,
  '5Nu5Uyoauauy9LFePYL1Z3' // late night,
]

router.get('/newQueue', (req, res) => {
  const accessToken = req.session[accessTokenKey]
  const refreshToken = req.session[refreshTokenKey]
  if (!accessToken || !refreshToken) return res.status(401).json(error(
    'You must be authenticated to Spotify to create queue.'
  ))

  const queueId = newQueue(req.userId, accessToken, refreshToken)
  queues[queueId].users[req.userId] = testTracks.slice()

  res.json({ queueId })
})

router.use('/queue/*', requireQueue)

router.get('/queue/data', (req, res) => {
  res.json({
    owner: req.owner,
  })
})



router.get('/queue/delete', (req, res) => {
  if (!req.owner) return res.status(401).end()

  delete queues[req.queueId]
  return res.end()
})


router.get('/queue/current', async (req, res) => {
  const queue = req.queue

  try {
    const trackData = getCurrent(queue) || await getNext(queue)
    if (trackData) return res.json({
      trackData,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).end()
  }
})
router.get('/queue/next', (req, res) => {
  if (!req.owner) return res.status(401).end()

  const queue = req.queue
  return res.json({
    trackId: getNext(queue),
  })
})
router.get('/queue/previous', (req, res) => {
  if (!req.owner) return res.status(401).end()

  const queue = req.queue
  return res.json({
    trackId: getPrevious(queue),
  })
})

router.post('/queue/track', (req, res) => {
  if (typeof req.body.trackId !== 'string') return res.status(400).end()

  if (!req.queue.users[req.userId]) {
    req.queue.users[req.userId] = []
  }
  req.queue.users[req.userId].push(req.body.trackId)
  return res.end()
})

router.post('/queue/progress', (req, res) => {
  if (!req.owner) return res.status(401).end()

  if (typeof req.body.progress !== 'number') return res.status(400).end()
  req.queue.progress = req.body.progress
  return res.end()
})

module.exports = router
