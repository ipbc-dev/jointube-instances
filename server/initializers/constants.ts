import * as config from 'config'

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
  }
}

const SORTABLE_COLUMNS = {
  INSTANCES: [ 'id', 'host', 'createdAt', 'totalUsers' ]
}

const PAGINATION_COUNT_DEFAULT = 20

export {
  CONFIG,
  API_VERSION,
  PAGINATION_COUNT_DEFAULT,
  SORTABLE_COLUMNS
}
