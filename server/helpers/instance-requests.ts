import { ServerConfig } from '../../PeerTube/shared/models'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { InstanceConnectivityStats } from 'shared/models/instance-connectivity-stats.model'
import { isTestInstance } from './core-utils'
import { faultTolerantResolve } from './utils'
import { doRequest } from './requests'

async function fetchInstanceConfig (host: string) {
  const path = '/api/v1/config'

  const options = {
    uri: getScheme() + host + path,
    method: 'GET',
    json: true,
    timeout: 5000
  }

  const { body } = await doRequest(options)
  return body as ServerConfig
}

async function fetchInstanceStats (host: string) {
  const path = '/api/v1/server/stats'

  const options = {
    uri: getScheme() + host + path,
    method: 'GET',
    json: true,
    timeout: 5000
  }

  const { body } = await doRequest(options)
  const supportsIPv6 = await faultTolerantResolve(host, 'AAAA')
  return {
    stats: body as ServerStats,
    connectivityStats: {
      supportsIPv6
    } as InstanceConnectivityStats
  }
}

async function getConfigAndStatsInstance (host: string) {
  const [ config, { stats, connectivityStats } ] = await Promise.all([
    fetchInstanceConfig(host),
    fetchInstanceStats(host)
  ])

  if (!config || !stats || config.serverVersion === undefined || stats.totalVideos === undefined) {
    throw new Error('Invalid remote host. Are you sure this is a PeerTube instance?')
  }

  return { config, stats, connectivityStats }
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
