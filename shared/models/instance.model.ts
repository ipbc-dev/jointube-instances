import { ServerConfig } from '../../PeerTube/shared'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'

export interface Instance {
  id: number
  host: string
  stats: ServerStats
  config: ServerConfig
}
