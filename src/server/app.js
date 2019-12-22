const path = require('path')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const config = require('./config')
const authController = require('./controllers/auth')
const spotifyController = require('./controllers/spotify')

const app = express()

const DIST = path.join(__dirname, '../../dist')



// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'))

if (process.env.NODE_ENV === 'development' || process.env.DEBUG) app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors({ origin: config.origin, credentials: true }))
app.use(cookieParser())

app.use(require('express-session')({
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: config.sessionMaxAge,
    secure: false,
  },
}))


// routes
if (process.env.NODE_ENV === 'production') app.use(express.static(DIST))

app.use('/*', (req, res, next) => {
  if (!req.session || !req.session.id) return res.status(400).json({
    error: 'No session ID.'
  })
  console.log(req.session.id)
  next()
})

app.use('/', authController)
app.use('/', spotifyController)

app.get('/ping', function(req, res) {
  res.status(200).send('pong!')
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err)
    res.status(err.status || 500).json(err)
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err)
  res.status(err.status || 500).end()
})

module.exports = app
