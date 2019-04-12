import { GlobalStats } from './global-stats.model'

export interface GlobalStatsHistory {
  data: {
    date: string, // YYYY-MM-DD
    stats: GlobalStats
  }[]
}
