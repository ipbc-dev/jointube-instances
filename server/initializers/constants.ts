import * as config from 'config'
import { isTestInstance } from '../helpers/core-utils'

const API_VERSION = 'v1'

const CONFIG = {
  LISTEN: {
    PORT: config.get<number>('listen.port')
  },
  WEBSERVER: {
    SCHEME: config.get<boolean>('webserver.https') === true ? 'https' : 'http',
    HOSTNAME: config.get<string>('webserver.hostname'),
    PORT: config.get<number>('webserver.port'),
    URL: ''
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
CONFIG.WEBSERVER.URL = CONFIG.WEBSERVER.SCHEME + '://' + CONFIG.WEBSERVER.HOSTNAME + ':' + CONFIG.WEBSERVER.PORT

const SORTABLE_COLUMNS = {
  INSTANCES: [
    'id',
    'host',
    'createdAt',
    'name',
    'health',
    'totalUsers',
    'totalVideos',
    'totalLocalVideos',
    'totalInstanceFollowers',
    'totalInstanceFollowing',
    'signupAllowed',
    'version',
    'country'
  ],

  INSTANCE_HOSTS: [ 'createdAt', 'host' ]
}

const PAGINATION_COUNT_DEFAULT = 20

let SCHEDULER_INTERVAL = 60000 * 60 // 1 hour
const CONCURRENCY_REQUESTS = 5

const INSTANCE_SCORE = {
  MAX: 10000,
  HEALTHY_AT: 9500,
  BONUS: 10,
  PENALTY: -30
}

const MAX_HISTORY_SIZE = 100

if (isTestInstance()) {
  SCHEDULER_INTERVAL = 10000
}

export {
  CONFIG,
  CONCURRENCY_REQUESTS,
  API_VERSION,
  INSTANCE_SCORE,
  PAGINATION_COUNT_DEFAULT,
  SORTABLE_COLUMNS,
  SCHEDULER_INTERVAL,
  MAX_HISTORY_SIZE
}
