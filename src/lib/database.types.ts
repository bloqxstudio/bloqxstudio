
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
      components: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          json_code: string
          preview_image?: string
          tags?: string[]
          type: string
          visibility: 'public' | 'private'
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          json_code: string
          preview_image?: string
          tags?: string[]
          type: string
          visibility?: 'public' | 'private'
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          json_code?: string
          preview_image?: string
          tags?: string[]
          type?: string
          visibility?: 'public' | 'private'
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          slug?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}

export type Component = Database['public']['Tables']['components']['Row']
export type NewComponent = Database['public']['Tables']['components']['Insert']
export type UpdateComponent = Database['public']['Tables']['components']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type NewCategory = Database['public']['Tables']['categories']['Insert']
export type UpdateCategory = Database['public']['Tables']['categories']['Update']
