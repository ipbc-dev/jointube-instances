export interface Instance {
  id: number
  host: string

  name: string
  version: string
  signupAllowed: boolean

  totalUsers: number
  totalLocalVideos: number
  totalInstanceFollowers: number
  totalInstanceFollowing: number
}
