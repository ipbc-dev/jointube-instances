import { InstanceStats } from './instance-stats.model'

export interface InstanceStatsHistory {
  data: {
    date: string, // YYYY-MM-DD
    stats: InstanceStats
  }[]
}
