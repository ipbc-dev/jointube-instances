import * as Pino from 'pino'

const pino = Pino({
  prettyPrint: true,
  level: 'debug'
})

// ---------------------------------------------------------------------------

export {
  pino as logger
}
