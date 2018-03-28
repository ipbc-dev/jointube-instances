import axios from 'axios'
import { ResultList } from '../../../PeerTube/shared/models/result-list.model'
import { Instance } from '../../../shared/models/instance.model'
import { buildApiUrl } from './utils'

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

export {
  listInstances,
  addInstance
}
