export interface Instance {
  id: number
  host: string

  name: string
  shortDescription: string
  version: string
  signupAllowed: boolean
  userVideoQuota: number

  totalUsers: number
  totalVideos: number
  totalLocalVideos: number
  totalInstanceFollowers: number
  totalInstanceFollowing: number

  supportsIPv6?: boolean
  country?: string

  health: number
}
