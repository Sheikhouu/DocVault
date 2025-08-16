export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          created_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          file_path: string | null
          file_size: number | null
          mime_type: string | null
          tags: string[] | null
          is_encrypted: boolean | null
          converted_pdf_url: string | null
          conversion_status: 'pending' | 'converting' | 'completed' | 'failed' | null
          conversion_error: string | null
          converted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          file_path?: string | null
          file_size?: number | null
          mime_type?: string | null
          tags?: string[] | null
          is_encrypted?: boolean | null
          converted_pdf_url?: string | null
          conversion_status?: 'pending' | 'converting' | 'completed' | 'failed' | null
          conversion_error?: string | null
          converted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string | null
          file_path?: string | null
          file_size?: number | null
          mime_type?: string | null
          tags?: string[] | null
          is_encrypted?: boolean | null
          converted_pdf_url?: string | null
          conversion_status?: 'pending' | 'converting' | 'completed' | 'failed' | null
          conversion_error?: string | null
          converted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 