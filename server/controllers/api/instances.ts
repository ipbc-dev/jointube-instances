import * as express from 'express'
import { ServerConfig } from '../../../PeerTube/shared/models'
import { ServerStats } from '../../../PeerTube/shared/models/server/server-stats.model'
import { InstanceConnectivityStats } from 'shared/models/instance-connectivity-stats.model'
import { retryTransactionWrapper } from '../../helpers/database-utils'
import { getConfigAndStatsAndAboutInstance } from '../../helpers/instance-requests'
import { logger } from '../../helpers/logger'
import { getFormattedObjects } from '../../helpers/utils'
import { asyncMiddleware } from '../../middlewares/async'
import { setDefaultPagination } from '../../middlewares/pagination'
import { setDefaultSort } from '../../middlewares/sort'
import {
  instanceGetValidator,
  instanceHostsValidator,
  instancesAddValidator,
  instancesListValidator
} from '../../middlewares/validators/instances'
import { paginationValidator } from '../../middlewares/validators/pagination'
import { instancesSortValidator } from '../../middlewares/validators/sort'
import { InstanceModel } from '../../models/instance'
import { HistoryModel } from '../../models/history'
import { InstanceStatsHistory } from '../../../shared/models/instance-stats-history.model'
import { GlobalStats } from '../../../shared/models/global-stats.model'
import { GlobalStatsHistory } from '../../../shared/models/global-stats-history'

const instancesRouter = express.Router()

instancesRouter.get('/hosts',
  instanceHostsValidator,
  paginationValidator,
  instanceHostsValidator,
  setDefaultSort,
  setDefaultPagination,
  asyncMiddleware(listInstanceHosts)
)

instancesRouter.get('/',
  instancesListValidator,
  paginationValidator,
  instancesSortValidator,
  setDefaultSort,
  setDefaultPagination,
  asyncMiddleware(listInstances)
)

instancesRouter.get('/:host/stats-history',
  instanceGetValidator,
  getInstanceStatsHistory
)

instancesRouter.get('/stats',
  asyncMiddleware(getGlobalStats)
)

instancesRouter.get('/stats-history',
  asyncMiddleware(getGlobalStatsHistory)
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
  let connectivityStats: InstanceConnectivityStats

  try {
    const res = await getConfigAndStatsAndAboutInstance(host)
    config = res.config
    stats = res.stats
    connectivityStats = res.connectivityStats
  } catch (err) {
    logger.warn(err)

    return res.status(409)
      .json({
        error: err.message
      })
      .end()
  }

  const options = {
    arguments: [ host, config, stats, connectivityStats ],
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

async function createInstance (host: string, config: ServerConfig, stats: ServerStats, connectivityStats: InstanceConnectivityStats) {
  const instanceCreated = await InstanceModel.create({
    host,
    config,
    stats,
    connectivityStats
  })

  logger.info('Instance %s created.', host)

  return instanceCreated
}

async function listInstances (req: express.Request, res: express.Response) {
  const signup = req.query.signup
  const healthy = req.query.healthy
  const nsfwPolicy = req.query.nsfwPolicy
  const search: string = req.query.search
  const minUserQuota = req.query.minUserQuota
  const categoriesOr = req.query.categoriesOr
  const languagesOr = req.query.languagesOr

  const resultList = await InstanceModel.listForApi({
    start: req.query.start,
    count: req.query.count,
    sort: req.query.sort,
    signup,
    healthy,
    nsfwPolicy,
    search,
    categoriesOr,
    languagesOr,
    minUserQuota
  })

  return res.json(getFormattedObjects(resultList.data, resultList.total))
}


async function listInstanceHosts (req: express.Request, res: express.Response) {
  const since = req.query.since

  const resultList = await InstanceModel.listForHostsApi(req.query.start, req.query.count, req.query.sort, { since })

  return res.json({
    total: resultList.total,
    data: resultList.data.map(d => d.toHostFormattedJSON())
  })
}

async function getGlobalStats (req: express.Request, res: express.Response) {
  const data: GlobalStats = await InstanceModel.getStats()

  return res.json(data).end()
}

async function getInstanceStatsHistory (req: express.Request, res: express.Response) {
  const instance = res.locals.instance

  const rows = await HistoryModel.getInstanceHistory(instance.id)

  const result: InstanceStatsHistory = {
    data: rows.map(d => d.toFormattedJSON())
  }

  return res.json(result).end()
}

async function getGlobalStatsHistory (req: express.Request, res: express.Response) {
  const rows = await HistoryModel.getGlobalStats()

  const result: GlobalStatsHistory = {
    data: rows
  }

  return res.json(result).end()
}
