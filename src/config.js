const serverConfig = require('./server/config')
const development = process.env.NODE_ENV === 'development'

export default {
  server: development ? serverConfig.server : serverConfig.origin,
  spotifyServer: 'https://api.spotify.com/v1'
}