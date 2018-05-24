import * as express from 'express'
import { ServerConfig } from '../../../PeerTube/shared/models'
import { ServerStats } from '../../../PeerTube/shared/models/server/server-stats.model'
import { retryTransactionWrapper } from '../../helpers/database-utils'
import { getConfigAndStatsInstance } from '../../helpers/instance-requests'
import { logger } from '../../helpers/logger'
import { getFormattedObjects } from '../../helpers/utils'
import { asyncMiddleware } from '../../middlewares/async'
import { setDefaultPagination } from '../../middlewares/pagination'
import { setDefaultSort } from '../../middlewares/sort'
import { instancesAddValidator, instancesListValidator } from '../../middlewares/validators/instances'
import { paginationValidator } from '../../middlewares/validators/pagination'
import { instancesSortValidator } from '../../middlewares/validators/sort'
import { InstanceModel } from '../../models/instance'
import { InstanceStats } from '../../../shared/models/instance-stats.model'

const instancesRouter = express.Router()

instancesRouter.get('/',
  instancesListValidator,
  paginationValidator,
  instancesSortValidator,
  setDefaultSort,
  setDefaultPagination,
  asyncMiddleware(listInstances)
)

instancesRouter.get('/stats',
  asyncMiddleware(getStats)
)

instancesRouter.post('/',
  asyncMiddleware(instancesAddValidator),
  asyncMiddleware(createInstanceRetryWrapper)
)

// ---------------------------------------------------------------------------

export {
  instancesRouter
}

// ---------------------------------------------------------------------------

async function createInstanceRetryWrapper (req: express.Request, res: express.Response, next: express.NextFunction) {
  const host = req.body.host

  let config: ServerConfig
  let stats: ServerStats

  try {
    const res = await getConfigAndStatsInstance(host)
    config = res.config
    stats = res.stats
  } catch (err) {
    logger.warn(err)

    return res.status(409)
      .json({
        error: err.message
      })
      .end()
  }

  const options = {
    arguments: [ host, config, stats ],
    errorMessage: 'Cannot insert the instance with many retries.'
  }
  const instance = await retryTransactionWrapper(createInstance, options)

  return res.json({
    instance: {
      id: instance.id,
      host: instance.host
    }
  }).end()
}

async function createInstance (host: string, config: ServerConfig, stats: ServerStats) {
  const instanceCreated = await InstanceModel.create({
    host,
    config,
    stats
  })

  logger.info('Instance %s created.', host)

  return instanceCreated
}

async function listInstances (req: express.Request, res: express.Response, next: express.NextFunction) {
  const signup = req.query.signup
  const healthy = req.query.healthy

  const resultList = await InstanceModel.listForApi(req.query.start, req.query.count, req.query.sort, { signup, healthy })

  return res.json(getFormattedObjects(resultList.data, resultList.total))
}

async function getStats (req: express.Request, res: express.Response, next: express.NextFunction) {
  const data: InstanceStats = await InstanceModel.getStats()

  return res.json(data).end()
}
