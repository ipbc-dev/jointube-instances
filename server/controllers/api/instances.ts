import * as express from 'express'
import { fetchInstanceConfig, fetchInstanceStats } from '../../helpers/instance-requests'
import { logger } from '../../helpers/logger'
import { instancesAddValidator, instancesRemoveValidator } from '../../middlewares/validators/instances'
import { instancesSortValidator } from '../../middlewares/validators/sort'
import { InstanceModel } from '../../models/instance'
import { retryTransactionWrapper } from '@peertube/server/helpers/database-utils'
import { getFormattedObjects } from '@peertube/server/helpers/utils'
import { setDefaultSort } from '@peertube/server/middlewares/sort'
import { setDefaultPagination } from '@peertube/server/middlewares/pagination'
import { asyncMiddleware } from '@peertube/server/middlewares/async'
import { paginationValidator } from '@peertube/server/middlewares/validators/pagination'
import { ServerConfig } from '@peertube/shared/models'
import { ServerStats } from '@peertube/shared/models/server/server-stats.model'

const instancesRouter = express.Router()

instancesRouter.get('/',
  paginationValidator,
  instancesSortValidator,
  setDefaultSort,
  setDefaultPagination,
  asyncMiddleware(listInstances)
)

instancesRouter.post('/',
  instancesAddValidator,
  asyncMiddleware(createInstanceRetryWrapper)
)

instancesRouter.delete('/:id',
  asyncMiddleware(instancesRemoveValidator),
  asyncMiddleware(removeInstance)
)

// ---------------------------------------------------------------------------

export {
  instancesRouter
}

// ---------------------------------------------------------------------------

async function createInstanceRetryWrapper (req: express.Request, res: express.Response, next: express.NextFunction) {
  const host = req.body.host

  const config = await fetchInstanceConfig(host)
  const stats = await fetchInstanceStats(host)

  if (!config.serverVersion || stats.totalVideos) {
    throw new Error('Invalid remote host. Are you sure this is a PeerTube instance?')
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
  const resultList = await InstanceModel.listForApi(req.query.start, req.query.count, req.query.sort)

  return res.json(getFormattedObjects(resultList.data, resultList.total))
}

async function removeInstance (req: express.Request, res: express.Response, next: express.NextFunction) {
  const instance = res.locals.instance as InstanceModel

  await instance.destroy()

  return res.sendStatus(204)
}
