import * as Pino from 'pino'
import { CONFIG } from '../initializers/constants'

const pino = Pino({
  prettyPrint: true,
  level: CONFIG.LOG.LEVEL
})

// ---------------------------------------------------------------------------

export {
  pino as logger
}
