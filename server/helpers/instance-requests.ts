import { doRequest } from '@peertube/server/helpers/requests'
import { ServerConfig } from '@peertube/shared/models'
import { ServerStats } from '@peertube/shared/models/server/server-stats.model'

async function fetchInstanceConfig (host: string) {
  const path = '/api/v1/config'

  const options = {
    uri: 'https:// ' + host,
    path,
    method: 'GET',
    json: true
  }

  const { body } = await doRequest(options)
  return body as Promise<ServerConfig>
}

async function fetchInstanceStats (host: string) {
  const path = '/api/v1/server/stats'

  const options = {
    uri: 'https:// ' + host,
    path,
    method: 'GET',
    json: true
  }

  const { body } = await doRequest(options)
  return body as Promise<ServerStats>
}

// ---------------------------------------------------------------------------

export {
  fetchInstanceConfig,
  fetchInstanceStats
}
