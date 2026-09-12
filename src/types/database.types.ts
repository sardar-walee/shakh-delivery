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
          full_name: string
          phone: string | null
          email: string | null
          avatar: string | null
          language: string
          theme_preference?: string | null
          status: string
          fcm_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          email?: string | null
          avatar?: string | null
          language?: string
          theme_preference?: string | null
          status?: string
          fcm_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          avatar?: string | null
          language?: string
          theme_preference?: string | null
          status?: string
          fcm_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          status: string
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          status?: string
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          status?: string
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          type: string
          name: string
          description: string | null
          logo: string | null
          cover_image: string | null
          status: string
          is_open: boolean
          latitude: number | null
          longitude: number | null
          address: string | null
          commission_rate: number
          created_at: string
          updated_at: string
        }
      }
      categories: {
        Row: {
          id: string
          business_id: string
          name: string
          name_ku: string | null
          name_ar: string | null
          image: string | null
          sort_order: number
          created_at: string
        }
      }
      products: {
        Row: {
          id: string
          business_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          discount: number
          stock: number
          images: string[] | null
          is_available: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          business_id: string
          captain_id: string | null
          status: string
          payment_status: string
          subtotal: number
          discount: number
          delivery_fee: number
          platform_fee: number
          total: number
          commission: number
          address: Json
          latitude: number | null
          longitude: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          pending_balance: number
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
