const path = require('path')
const env = require('dotenv')

const development = process.env.NODE_ENV === 'development'
if (development) {
  env.config({ path: path.join(__dirname, '../../.env.development.local') })
  env.config({ path: path.join(__dirname, '../../.env.development') })
} else if (process.env.NODE_ENV === 'test') {
  env.config({ path: path.join(__dirname, '../../.env.test.local') })
  env.config({ path: path.join(__dirname, '../../.env.test') })
} else if (process.env.NODE_ENV === 'production') {
  env.config({ path: path.join(__dirname, '../../.env.production.local') })
  env.config({ path: path.join(__dirname, '../../.env.production') })
}
env.config({ path: path.join(__dirname, '../../.env.local') })
env.config({ path: path.join(__dirname, '../../.env') })


const config = {
  protocol: process.env.VUE_APP_PROTOCOL || 'http',
  port: process.env.VUE_APP_PORT || 3000,
  host: process.env.VUE_APP_HOST || 'localhost',


  sessionMaxAge: 1000 * 3600 * 24, // 24 hours

  secret: process.env.SECRET,

  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,

  stateKey: 'spotify_auth_state',
  accessTokenKey: 'spotify_access_token',
  refreshTokenKey: 'spotify_refresh_token',
  userIdKey: 'user_id',
  queueIdKey: 'queue_id',

  spotifyServer: 'https://api.spotify.com/v1',
}
config.origin = process.env.VUE_APP_ORIGIN || 'http://localhost:8080'
config.server = process.env.VUE_APP_SERVER ||
  `${config.protocol}://${config.host}:${config.port}`

module.exports = config
