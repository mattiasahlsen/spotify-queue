const express = require('express')
const fetch = require('node-fetch')
const router = express.Router()
const config = require('../config')
const queryString = require('querystring')
const { log, logErr } = require('../logger')

const { generateRandomString, } = require('../lib')

const dev = process.env.NODE_ENV === 'development'

const redirectUri = config.server + '/callback'

const {
  stateKey,
  accessTokenKey,
  refreshTokenKey,
  queueIdKey,
  userIdKey,
} = config

const redirectKey = 'origin_url'

const spotifyServer = 'https://api.spotify.com/v1'

router.get('/login', (req, res) => {
  const state = generateRandomString(16)
  res.cookie(stateKey, state)
  res.cookie(redirectKey, req.query.redirect)

  const scope = 'user-read-playback-state user-modify-playback-state'
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

  const userRedirect = (req.cookies ? req.cookies[redirectKey] : null) ||
    config.origin
  res.clearCookie(redirectKey)

  const failureRedirect = () => {
    return res.redirect(userRedirect + '?' + 
      queryString.stringify({
        error: 'authentication_failure'
      }))
  }

  if (state === null || state !== storedState) {
    return res.redirect(userRedirect + '?' + 
      queryString.stringify({
        error: 'state_mismatch'
      }))
  } else {
    res.clearCookie(stateKey)
    if (req.query.error === 'access_denied') return failureRedirect()

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
      if (resp.status !== 200) {
        logErr(new Error('Spotify bad status when fetching token: ' + resp.status))
        return failureRedirect()
      }
      try {
        const data = await resp.json()
        const accessToken = data.access_token
        const refreshToken = data.refresh_token


        if (!accessToken || !refreshToken) {
          return failureRedirect()
        }


        return fetch(spotifyServer + '/me', {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        }).then(async resp => {
          if (resp.status === 200) {
            const data = await resp.json()
            req.session[accessTokenKey] = accessToken
            req.session[refreshTokenKey] = refreshToken
            req.session[userIdKey] = data.id

            res.redirect(userRedirect)
          } else return failureRedirect()
        }).catch(err => {
          return failureRedirect()
        })

      } catch (err) {
        logErr(err)
        return failureRedirect()
      }
    })
  }
})

router.get('/authenticate', (req, res, next) => {
  let userId = req.session[userIdKey]


  if (!userId) {
    userId = generateRandomString(16)
    req.session[userIdKey] = userId
  }
  return res.json({
    authorized: !!req.session[refreshTokenKey],
    userId,
  })
})

router.get('/logout', (req, res, next) => {
  delete req.session[accessTokenKey]
  delete req.session[refreshTokenKey]
  delete req.session[userIdKey]
  res.end()
})


module.exports = router
