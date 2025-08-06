import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export type DocumentCategory = 
  | 'identity'
  | 'education'
  | 'employment'
  | 'housing'
  | 'financial'
  | 'health'
  | 'legal'
  | 'other'

export interface DocumentWithMetadata extends Document {
  isExpiringSoon?: boolean
  daysUntilExpiry?: number
}

export interface AuthError {
  message: string
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
}

export interface SubscriptionLimits {
  maxDocuments: number
  maxStorageSize: number // en bytes
  canShare: boolean
  canSetReminders: boolean
} 