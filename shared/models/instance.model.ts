import { InstanceStats } from './instance-stats.model'
import { NSFWPolicyType } from '../../PeerTube/shared/models/videos/nsfw-policy.type'

export interface Instance extends InstanceStats {
  id: number
  host: string

  name: string
  shortDescription: string
  version: string
  signupAllowed: boolean
  userVideoQuota: number

  categories: number[]
  languages: string[]

  autoBlacklistUserVideosEnabled: boolean
  defaultNSFWPolicy: NSFWPolicyType
  isNSFW: boolean

  supportsIPv6?: boolean
  country?: string

  health: number
}
