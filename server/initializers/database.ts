import { Sequelize as SequelizeTypescript } from 'sequelize-typescript'
import { isTestInstance } from '../helpers/core-utils'
import { logger } from '../helpers/logger'

import { InstanceModel } from '../models/instance'
import { CONFIG } from './constants'
import { HistoryModel } from '../models/history'

require('pg').defaults.parseInt8 = true // Avoid BIGINT to be converted to string

const dbname = CONFIG.DATABASE.DBNAME
const username = CONFIG.DATABASE.USERNAME
const password = CONFIG.DATABASE.PASSWORD
const host = CONFIG.DATABASE.HOSTNAME
const port = CONFIG.DATABASE.PORT

const sequelizeTypescript = new SequelizeTypescript({
  database: dbname,
  dialect: 'postgres',
  host,
  port,
  username,
  password,
  benchmark: isTestInstance(),
  logging: (message: string, benchmark: number) => {
    if (process.env.NODE_DB_LOG === 'false') return

    let newMessage = message
    if (isTestInstance() === true && benchmark !== undefined) {
      newMessage += ' | ' + benchmark + 'ms'
    }

    logger.debug(newMessage)
  }
})

async function initDatabaseModels (silent: boolean) {
  sequelizeTypescript.addModels([
    InstanceModel,
    HistoryModel
  ])

  if (!silent) logger.info('Database %s is ready.', dbname)

  return
}

// ---------------------------------------------------------------------------

export {
  initDatabaseModels,
  sequelizeTypescript
}
