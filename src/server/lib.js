const queryString = require('querystring')
const fetch = require('node-fetch')

const config = require('./config')

const {
  userIdKey,
  accessTokenKey,
  queueIdKey,

} = config


const generateRandomString = length => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}


const fetchOptions = queue => ({
  headers: {
    'Authorization': 'Bearer ' + queue.accessToken
  }
})

const error = msg => ({ error: msg })
const fetchError = resp => {
  const err = new Error(resp.statusText)
  err.resp = resp
  err.status = resp.status
  return err
}

const checkStatus = async resp => {
  if (resp.status >= 400 && resp.status < 600) {
    throw fetchError(resp)
  }
  else return resp
}

const refreshToken = queue => {
  const refreshToken = queue.refreshToken
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
  }).then(checkStatus).then(async resp => {
    const data = await resp.json()
    queue.accessToken = data.access_token
    return data.access_token
  })
}

const myFetch = (sendRequest, queue) => {
  return sendRequest().then(resp => {
    if (resp && resp.status === 401) return refreshToken(queue).then(sendRequest)
    else return resp
  })
}

const requireAuth = (req, res, next) => {
  if (!req.session) return res.status(400).json(error('Authentication error.'))
  if (!req.session[userIdKey]) return res.status(401).end()

  req.userId = req.session[userIdKey]
  next()

}

module.exports = {
  generateRandomString,
  
  refreshToken,
  error,

  myFetch,
  checkStatus,
  fetchOptions,
  fetchError,

  requireAuth,
}
