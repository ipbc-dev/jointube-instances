export interface Instance {
  id: number
  host: string

  name: string
  shortDescription: string
  version: string
  signupAllowed: boolean

  totalUsers: number
  totalVideos: number
  totalLocalVideos: number
  totalInstanceFollowers: number
  totalInstanceFollowing: number

  health: number
}
