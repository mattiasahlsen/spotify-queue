#!/usr/bin/env node

const app = require('./app')
const config = require('./config')
const http = require('http')
const listen = require('./socket')
const { log, logErr } = require('./logger')

const port = config.port

app.set('port', port)
const server = http.createServer(app)


server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

const io = require('socket.io')(server)
io.on('connection', socket => {
  listen(socket)
})

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  logErr(error)
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES': throw new Error(port + ' requires elevated privileges')
    case 'EADDRINUSE': throw new Error(port + ' is already in use')
    default: throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  console.log('HTTP server listening on ' + bind)
}
