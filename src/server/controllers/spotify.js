const express = require('express')
const fetch = require('node-fetch')
const config = require('../config')
const queryString = require('querystring')
const { log, logErr } = require('../logger')

const router = express.Router()

const {
  myFetch,
  fetchOptions,
  refreshToken,

  error,
  fetchError,
  checkStatus
} = require('../lib')

const {
  userIdKey,
  accessTokenKey,
  spotifyServer,
} = config

const {
  requireQueue,
} = require('../queue')

const {
  resume,
  pause,
  playNext,
  playPrevious,
} = require('../player')



router.use('/spotify/*', requireQueue)

router.get('/spotify/search', (req, res) => {
  const q = req.query.q
  if (typeof q !== 'string') return res.status(400).end()

  const search = () => fetch(config.spotifyServer + '/search?' + 
    queryString.stringify({ q, type: 'track' }),
    fetchOptions(req.queue)
  )

  return myFetch(search, req.queue)
    .then(checkStatus)
    .then(async resp => res.json(await resp.json()))
    .catch(err => {
      logErr(err)
      return res.status(err.status || 500).end()
    })
})

router.get('/spotify/*', (req, res, next) => {
  if (!req.owner) return res.status(401).end()
  next()
})

router.get('/spotify/resume', (req, res) => {
  const resumeQueue = () => resume(req.queue)
  return myFetch(resumeQueue, req.queue)
    .then(resp => res.end())
    .catch(err => {
      const status  = err.status || 500
      if (err.clientMessage) {
        return res.status(status).json(error(err.clientMessage))
      }
      return res.status(status).end()
    })
})

router.get('/spotify/pause', (req, res) => {
  const pauseQueue = () => pause(req.queue)
  return myFetch(pauseQueue, req.queue)
    .then(resp => res.end())
    .catch(err => {
      const status = err.status || 500
      if (err.clientMessage) {
        return res.status(status).json(error(err.clientMessage))
      }
      else return res.status(status).end()
    })
})

router.get('/spotify/next', (req, res) => {
  const nextTrack = () => playNext(req.queue)
  return myFetch(nextTrack, req.queue)
    .then(resp => res.end())
    .catch(err => {
      const status = err.status || 500
      if (err.clientMessage) {
        return res.status(status).json(error(err.clientMessage))
      }
      else return res.status(status).end()
    })
})

router.get('/spotify/previous', (req, res) => {
  const previousTrack = () => playPrevious(req.queue)
  return myFetch(previousTrack, req.queue)
    .then(resp => res.end())
    .catch(err => {
      const status = err.status || 500
      if (err.clientMessage) {
        return res.status(status).json(error(err.clientMessage))
      }
      return res.status(status).end()
    })
})

router.get('/spotify/devices', (req, res) => {
  const url = config.spotifyServer + '/me/player/devices'
  const devices = () => fetch(url, fetchOptions(req.queue))
  return myFetch(devices, req.queue)
    .then(async resp => {
      const data = await resp.json()
      res.json({ devices: data.devices, deviceId: req.queue.deviceId })
    })
    .catch(err => {
      logErr(err)
      return res.status(err.status || 500).end()
    })
})

router.post('/spotify/device', (req, res) => {
  const id = req.body.id
  if (typeof id !== 'string') return res.status(400).end()

  if (!req.queue.isPlaying) {
    req.queue.deviceId = id
    return res.end()
  }

  const url = config.spotifyServer + '/me/player'
  const changeDevice = () => fetch(url, {
    ...fetchOptions(req.queue),
    body: JSON.stringify({ device_ids: [id] }),
    method: 'PUT'
  })
  return myFetch(changeDevice, req.queue)
    .then(resp => {
      req.queue.deviceId = id
      return res.end()
    })
    .catch(err => {
      logErr(err)
      return res.status(err.status || 500).end()
    })
})

module.exports = router
