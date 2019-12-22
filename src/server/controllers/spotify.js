const express = require('express')
const fetch = require('node-fetch')
const router = express.Router()
const config = require('../config')
const queryString = require('querystring')

const {
  generateRandomString,
  queues,
  newQueue,
  getPrevious,
  getCurrent,
  getNext,
} = require('../lib')

const { accessTokenKey } = config

const queueIdKey = 'queue_id'


const testTracks = [
  '7KT7VGnPU5QVXN3q1BOeqb', // higher ground,
  '63yesoRJgXT5QALryYFV0X', // boy,
  '5Nu5Uyoauauy9LFePYL1Z3' // late night,
]

router.use('/queue/*', (req, res, next) => {
  const queueId = req.cookies && req.cookies[queueIdKey]
  if (!queueId) return res.status(404).end()

  const queue = queues[queueId]
  if (!queue) {
    res.clearCookie(queueIdKey)
    return res.status(404).end()
  }
  req.queueId = queueId
  req.queue = queue
  next()
})

router.get('/queue/id', (req, res) => {
  return res.json({
    queueId: req.queueId,
  })
})

router.get('/newQueue', (req, res) => {
  const queueId = newQueue(req.session.id)
  queues[queueId].users[req.session.id] = testTracks
  res.cookie(queueIdKey, queueId)

  return res.json({
    queueId
  })
})

router.get('/queue/delete', (req, res) => {
  if (req.queue.owner !== req.session.id) return res.status(401).end()

  delete queues[req.queueId]
  res.clearCookie(queueIdKey)
  return res.end()
})


router.get('/queue/current', (req, res) => {
  const queue = req.queue

  const trackId = getCurrent(queue) || getNext(queue)
  return res.json({
    trackId,
    progress: queue.progress,
  })
})
router.get('/queue/next', (req, res) => {
  if (req.queue.owner !== req.session.id) return res.status(401).end()

  const queue = req.queue
  return res.json({
    trackId: getNext(queue),
  })
})
router.get('/queue/previous', (req, res) => {
  if (req.queue.owner !== req.session.id) return res.status(401).end()

  const queue = req.queue
  return res.json({
    trackId: getPrevious(queue),
  })
})

router.post('/queue/track', (req, res) => {
  if (typeof req.body.trackId !== 'string') return res.status(400).end()

  req.queue.users[req.session.id].push(req.body.trackId)
  return res.end()
})
router.post('/queue/progress', (req, res) => {
  if (req.queue.owner !== req.session.id) return res.status(401).end()

  if (typeof req.body.progress !== 'number') return res.status(400).end()
  req.queue.progress = req.body.progress
  return res.end()
})

module.exports = router
