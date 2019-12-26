const {
  queues,
} = require('./queue')
const {
  generateRandomString
} = require('./lib')

const listen = socket => {
  let queue
  const userId = generateRandomString(32)

  socket.on('queue', id => {
    if (queue) delete queue.sockets[userId]
    queue = queues[id]
    if (queue) queue.sockets[userId] = socket
  })

  socket.on('disconnect', reason => {
    if (queue) delete queue.sockets[userId]
  })
}

module.exports = listen
