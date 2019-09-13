import axios from 'axios'
import { ResultList } from '../../../PeerTube/shared/models/result-list.model'
import { Instance } from '../../../shared/models/instance.model'
import { buildApiUrl } from './utils'
import { InstanceStats } from '../../../shared/models/instance-stats.model'
import { GlobalStatsHistory } from '../../../shared/models/global-stats-history'

const baseInstancePath = '/api/v1/instances'

function listInstances (params: { page: number, perPage: number, sort: string, search?: string }) {
  const options = {
    params: {
      start: (params.page - 1) * params.perPage,
      count: params.perPage,
      sort: params.sort
    }
  }

  if (params.search) Object.assign(options.params, { search: params.search })

  return axios.get<ResultList<Instance>>(buildApiUrl(baseInstancePath), options)
    .then(res => res.data)
}

function addInstance (host: string) {
  return axios.post(buildApiUrl(baseInstancePath), { host })
}

function getInstanceStats () {
  return axios.get<InstanceStats>(buildApiUrl(baseInstancePath) + '/stats')
              .then(res => res.data)
}

function getGlobalStatsHistory () {
  return axios.get<GlobalStatsHistory>(buildApiUrl(baseInstancePath) + '/stats-history')
              .then(res => res.data)
}

export {
  listInstances,
  addInstance,
  getGlobalStatsHistory,
  getInstanceStats
}
