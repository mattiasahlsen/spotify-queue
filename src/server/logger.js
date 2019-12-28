const path = require('path')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, simple } = format

const LOG_DIR = path.join(__dirname, 'logs')

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    simple()
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({
      filename: path.join(LOG_DIR, 'error.log'), level: 'error'
    }),
    new transports.File({
      filename: path.join(LOG_DIR, 'combined.log')
    })
  ]
})

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }))
}


const logErr = err => {
  logger.log({
    level: 'error',
    message: err.message,
    error: err
  })
}

module.exports = {
  log: logger.log.bind(logger, 'info'),
  logErr,
}
