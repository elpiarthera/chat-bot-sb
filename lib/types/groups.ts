export interface UserGroup {
  id: number
  name: string
  users: {
    id: string
    email: string
    name?: string
  }[]
  resources: {
    id: number
    name: string
    type: string
  }[]
  created_at: string
  updated_at: string
  is_up_to_date?: boolean
  is_up_for_deletion?: boolean
}

export interface UserGroupCreation {
  name: string
  user_ids: string[]
  resource_ids: number[]
  cc_pair_ids?: number[]
}

export interface UserGroupUpdate {
  user_ids: string[]
  resource_ids: number[]
  cc_pair_ids?: number[]
}

export interface SetCuratorRequest {
  user_id: string
  is_curator: boolean
}
