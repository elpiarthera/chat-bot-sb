export interface Connector<T = any> {
  id: string
  name: string
  source: string
  input_type: string
  connector_specific_config: T
  refresh_freq?: number
  disabled?: boolean
  created_at: string
  updated_at: string
}
