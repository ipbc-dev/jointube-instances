import { InstanceStats } from './instance-stats.model'

export interface Instance extends InstanceStats {
  id: number
  host: string

  name: string
  shortDescription: string
  version: string
  signupAllowed: boolean
  userVideoQuota: number

  supportsIPv6?: boolean
  country?: string

  health: number
}
