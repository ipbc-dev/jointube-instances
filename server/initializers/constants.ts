import * as config from 'config'
import { isTestInstance } from '../helpers/core-utils'

const API_VERSION = 'v1'

const CONFIG = {
  LISTEN: {
    PORT: config.get<number>('listen.port')
  },
  DATABASE: {
    DBNAME: config.get<string>('database.name'),
    HOSTNAME: config.get<string>('database.hostname'),
    PORT: config.get<number>('database.port'),
    USERNAME: config.get<string>('database.username'),
    PASSWORD: config.get<string>('database.password')
  },
  LOG: {
    LEVEL: config.get<string>('log.level')
  }
}

const SORTABLE_COLUMNS = {
  INSTANCES: [ 'id', 'host', 'createdAt', 'totalUsers' ]
}

const PAGINATION_COUNT_DEFAULT = 20

let SCHEDULER_INTERVAL = 60000 * 60 // 1 hour

if (isTestInstance()) {
  SCHEDULER_INTERVAL = 10000
}

export {
  CONFIG,
  API_VERSION,
  PAGINATION_COUNT_DEFAULT,
  SORTABLE_COLUMNS,
  SCHEDULER_INTERVAL
}
