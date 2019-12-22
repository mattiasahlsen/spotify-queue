const queues = {}

const generateRandomString = length => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const newQueue = ownerId => {
  const queueId = generateRandomString(32)

  const queue = {
    owner: ownerId,
    users: {},
    played: [],
    index: 0,
    progress: 0,
  }
  queues[queueId] = queue
  setTimeout(() => {
    delete queues[queueId]
  }, 1000 * 3600 * 24) // delete after 24 hours

  return queueId
}

const getPrevious = queue => {
  queue.progress = 0
  if (queue.index === 0) return queue.played[0]
  queue.index--
  return queue.played[queue.index]
}

const getCurrent = queue => {
  return queue.played[queue.index]
}

const getNext = queue => {
  queue.progress = 0
  if (queue.index < queue.played.length) queue.index++
  if (queue.index < queue.played.length) return queue.played[queue.index]

  const userQueues = Object.values(queue.users)
  const userQueue = userQueues[Math.floor(Math.random() * userQueues.length)]
  const nextSong = userQueue.shift()

  if (nextSong) queue.played.push(nextSong)
  return nextSong
}

module.exports = {
  generateRandomString,
  queues,
  newQueue,
  
  getPrevious,
  getCurrent,
  getNext,
}
