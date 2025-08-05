export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'premium' | 'enterprise'
  created_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  description?: string
  category?: string
  file_path: string
  file_size: number
  mime_type: string
  expiry_date?: string
  tags?: string[]
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

export interface DocumentFormData {
  title: string
  description?: string
  category?: string
  expiry_date?: string
  tags?: string[]
}

export interface AuthFormData {
  email: string
  password: string
  full_name?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
} 