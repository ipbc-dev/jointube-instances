import { ServerConfig } from '../../PeerTube/shared/models'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { isTestInstance } from './core-utils'
import { doRequest } from './requests'

async function fetchInstanceConfig (host: string) {
  const path = '/api/v1/config'

  const options = {
    uri: getScheme() + host + path,
    method: 'GET',
    json: true
  }

  const { body } = await doRequest(options)
  return body as ServerConfig
}

async function fetchInstanceStats (host: string) {
  const path = '/api/v1/server/stats'

  const options = {
    uri: getScheme() + host + path,
    method: 'GET',
    json: true
  }

  const { body } = await doRequest(options)
  return body as ServerStats
}

async function getConfigAndStatsInstance (host: string) {
  const [ config, stats ] = await Promise.all([
    fetchInstanceConfig(host),
    fetchInstanceStats(host)
  ])

  if (!config || !stats || config.serverVersion === undefined|| stats.totalVideos === undefined) {
    throw new Error('Invalid remote host. Are you sure this is a PeerTube instance?')
  }

  return { config, stats }
}

// ---------------------------------------------------------------------------

export {
  getConfigAndStatsInstance,
  fetchInstanceConfig,
  fetchInstanceStats
}

// ---------------------------------------------------------------------------

function getScheme () {
  if (isTestInstance()) return 'http://'

  return 'https://'
}
