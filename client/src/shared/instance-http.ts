import axios from 'axios'
import { ResultList } from '../../../PeerTube/shared/models/result-list.model'
import { Instance } from '../../../shared/models/instance.model'
import { buildApiUrl } from './utils'
import { InstanceStats } from '../../../shared/models/instance-stats.model'

const baseInstancePath = '/api/v1/instances'

function listInstances (sort?: string) {
  const options = {
    params: {
      sort,
      start: 0,
      count: 500 // https://github.com/xaksis/vue-good-table/issues/186
    }
  }

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

export {
  listInstances,
  addInstance,
  getInstanceStats
}
