import { ServerConfig } from '../../PeerTube/shared/models'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { InstanceConnectivityStats } from 'shared/models/instance-connectivity-stats.model'
import { countryLookup } from '../initializers/geoip'
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
  const ipv4Addresses = await faultTolerantResolve(host, 'A')
  const ipv6Addresses = await faultTolerantResolve(host, 'AAAA')
  const addresses = [...ipv4Addresses, ...ipv6Addresses]

  const supportsIPv6 = ipv6Addresses.length > 0
  const country = (addresses.length > 0) ?
    (await countryLookup(addresses[0])).country.iso_code // lookup does a country lookup on a local geoip db downloaded on first use
    : undefined

  return {
    stats: body as ServerStats,
    connectivityStats: {
      supportsIPv6,
      country
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
