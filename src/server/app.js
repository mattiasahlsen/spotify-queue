const path = require('path')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const redis = require('redis')
const session = require('express-session')

const config = require('./config')
const authController = require('./controllers/auth')
const queueController = require('./controllers/queue')
const spotifyController = require('./controllers/spotify')
const { log, logErr } = require('./logger')

const app = express()

const DIST = path.join(__dirname, '../../dist')

const DEV = process.env.NODE_ENV === 'development'

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'))

if (DEV) {
  app.use(morgan('dev'))
  app.use(cors({ origin: true, credentials: true }))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

const RedisStore = require('connect-redis')(session)
const client = redis.createClient()

app.use(session({
  store: new RedisStore({ client }),
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: config.sessionMaxAge,
    secure: false,
  },
}))


// routes
app.use(express.static(DIST))


// ORDER MATTERS
app.use('/', authController)
app.use('/', queueController)
app.use('/', spotifyController)

app.get('/ping', function(req, res) {
  res.status(200).send('pong!')
})

app.get('/*', (req, res) => {
  return res.sendFile(DIST + '/index.html')
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    logErr(err)
    res.status(err.status || 500).json(err)
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  logErr(err)
  res.status(err.status || 500).end()
})

module.exports = app
