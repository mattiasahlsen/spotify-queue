const express = require('express')
const fetch = require('node-fetch')
const router = express.Router()
const config = require('../config')
const queryString = require('querystring')

const { generateRandomString, newQueue } = require('../lib')

const dev = process.env.NODE_ENV === 'development'

const redirectUri = (dev ? config.server : config.origin) + '/callback'

const { stateKey, accessTokenKey, refreshTokenKey } = config


router.get('/login', (req, res) => {

  const state = generateRandomString(16)
  res.cookie(stateKey, state)

  const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming app-remote-control'
  return res.redirect('https://accounts.spotify.com/authorize?' +
    queryString.stringify({
      response_type: 'code',
      client_id: config.clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state
    }))
})


router.get('/callback', (req, res) => {
  const code = req.query.code || null
  const state = req.query.state || null
  const storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    return res.redirect(config.origin + '?' + 
      queryString.stringify({
        error: 'state_mismatch'
      }))
  } else {
    res.clearCookie(stateKey);

    const formData = new URLSearchParams()
    formData.append('grant_type', 'authorization_code')
    formData.append('code', code)
    formData.append('redirect_uri', redirectUri)


    return fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' +
          new Buffer(config.clientId + ':' + config.clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    }).then(async resp => {
      if (req.query.error === 'access_denied') return res.redirect(401, config.origin)
      if (resp.status !== 200) {
        console.log('Spotify bad status when fetching token: ' + resp.status)
        return res.redirect(500, config.origin)
      }
      try {
        const data = await resp.json()
        const accessToken = data.access_token
        const refreshToken = data.refresh_token

        if (!accessToken || !refreshToken) {
          return res.redirect(config.origin + '?' + 
            queryString.stringify({
              error: 'authentication_failure'
            }))
        }

        res.cookie(accessTokenKey, accessToken);
        res.cookie(refreshTokenKey, refreshToken);

        // create queue
        const queueId = newQueue(req.session.id)
        queues[queueId].users[req.session.id] = testTracks
        res.cookie(queueIdKey, queueId)

        
        return res.redirect(config.origin)
      } catch (err) {
        res.redirect(500, config.origin)
        console.log(err)
      }
    })
  }
})

router.get('/refreshToken', function(req, res) {
  // requesting access token from refresh token
  const refreshToken = req.cookies ? req.cookies[refreshTokenKey] : null

  if (!refreshToken) {
    console.log('No refresh token.')
    return res.status(401).end()
  }

  const formData = new URLSearchParams()
  formData.append('grant_type', 'refresh_token')
  formData.append('refresh_token', refreshToken)

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' +
        new Buffer(config.clientId + ':' + config.clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  }).then(async resp => {
    if (req.query.error === 'access_denied') return res.redirect(401, config.origin)
    if (resp.status !== 200) {
      console.log('Spotify bad status when refreshing token: ' + resp.status)
      return res.redirect(500, config.origin)
    }
    try {
      const data = await resp.json()
      const accessToken = data.access_token

      if (!accessToken) {
        console.log('No access token')
        return res.status(500).end()
      }

      res.cookie(accessTokenKey, accessToken);
      return res.json({accessToken})
    } catch (err) {
      res.status(500).end()
      console.log(err)
    }
  })
})

router.get('/accessToken', (req, res, next) => {
  const accessToken = req.cookies ? req.cookies[accessTokenKey] : null
  return res.json({accessToken})
})

router.get('/logout', (req, res, next) => {
  res.clearCookie(accessTokenKey)
  res.clearCookie(refreshTokenKey)
  res.end()
})

module.exports = router
