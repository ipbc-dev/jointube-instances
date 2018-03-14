import { ServerConfig } from '../../PeerTube/shared/models'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { doRequest } from './requests'

async function fetchInstanceConfig (host: string) {
  const path = '/api/v1/config'

  const options = {
    uri: 'https://' + host + path,
    method: 'GET',
    json: true
  }

  const { body } = await doRequest(options)
  return body as ServerConfig
}

async function fetchInstanceStats (host: string) {
  const path = '/api/v1/server/stats'

  const options = {
    uri: 'https://' + host + path,
    method: 'GET',
    json: true
  }

  const { body } = await doRequest(options)
  return body as ServerStats
}

// ---------------------------------------------------------------------------

export {
  fetchInstanceConfig,
  fetchInstanceStats
}
