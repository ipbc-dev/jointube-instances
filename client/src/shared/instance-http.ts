import axios from 'axios'
import { ResultList } from '../../../PeerTube/shared/models/result-list.model'
import { Instance } from '../../../shared/models/instance.model'
import { buildApiUrl } from './utils'

const baseInstancePath = '/api/v1/instances'

function listInstances () {
  return axios.get<ResultList<Instance>>(buildApiUrl(baseInstancePath))
    .then(res => res.data)
}

function addInstance (host: string) {
  return axios.post(buildApiUrl(baseInstancePath), { host })
}

export {
  listInstances,
  addInstance
}
