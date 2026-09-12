export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          avatar: string | null;
          language: string;
          theme_preference: string | null;
          status: string;
          fcm_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          avatar?: string | null;
          language?: string;
          theme_preference?: string | null;
          status?: string;
          fcm_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          avatar?: string | null;
          language?: string;
          theme_preference?: string | null;
          status?: string;
          fcm_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          status: string;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          status?: string;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          status?: string;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          type: string;
          name: string;
          description: string | null;
          logo: string | null;
          cover_image: string | null;
          status: string;
          is_open: boolean;
          latitude: number | null;
          longitude: number | null;
          address: string | null;
          commission_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          type: string;
          name: string;
          description?: string | null;
          logo?: string | null;
          cover_image?: string | null;
          status?: string;
          is_open?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          commission_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          type?: string;
          name?: string;
          description?: string | null;
          logo?: string | null;
          cover_image?: string | null;
          status?: string;
          is_open?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          commission_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          name_ku: string | null;
          name_ar: string | null;
          image: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          name_ku?: string | null;
          name_ar?: string | null;
          image?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          name_ku?: string | null;
          name_ar?: string | null;
          image?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          discount: number;
          stock: number;
          images: string[] | null;
          is_available: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          discount?: number;
          stock?: number;
          images?: string[] | null;
          is_available?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          discount?: number;
          stock?: number;
          images?: string[] | null;
          is_available?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          business_id: string;
          captain_id: string | null;
          status: string;
          payment_status: string;
          subtotal: number;
          discount: number;
          delivery_fee: number;
          platform_fee: number;
          total: number;
          commission: number;
          address: Json;
          latitude: number | null;
          longitude: number | null;
          notes: string | null;
          category: string | null;
          estimated_delivery_minutes: number | null;
          is_scheduled: boolean | null;
          scheduled_date: string | null;
          scheduled_time: string | null;
          scheduled_slot_label: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id: string;
          business_id: string;
          captain_id?: string | null;
          status?: string;
          payment_status?: string;
          subtotal: number;
          discount?: number;
          delivery_fee?: number;
          platform_fee?: number;
          total: number;
          commission?: number;
          address: Json;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          category?: string | null;
          estimated_delivery_minutes?: number | null;
          is_scheduled?: boolean | null;
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          scheduled_slot_label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string;
          business_id?: string;
          captain_id?: string | null;
          status?: string;
          payment_status?: string;
          subtotal?: number;
          discount?: number;
          delivery_fee?: number;
          platform_fee?: number;
          total?: number;
          commission?: number;
          address?: Json;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          category?: string | null;
          estimated_delivery_minutes?: number | null;
          is_scheduled?: boolean | null;
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          scheduled_slot_label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          options: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          options?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          options?: Json | null;
          created_at?: string;
        };
      };
      delivery_addresses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          tag: string;
          city: string;
          district: string | null;
          sub_district: string | null;
          street_address: string;
          building_name: string | null;
          floor_apartment: string | null;
          nearest_landmark: string | null;
          latitude: number;
          longitude: number;
          phone_contact: string | null;
          driver_instructions: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          tag?: string;
          city: string;
          district?: string | null;
          sub_district?: string | null;
          street_address: string;
          building_name?: string | null;
          floor_apartment?: string | null;
          nearest_landmark?: string | null;
          latitude: number;
          longitude: number;
          phone_contact?: string | null;
          driver_instructions?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          tag?: string;
          city?: string;
          district?: string | null;
          sub_district?: string | null;
          street_address?: string;
          building_name?: string | null;
          floor_apartment?: string | null;
          nearest_landmark?: string | null;
          latitude?: number;
          longitude?: number;
          phone_contact?: string | null;
          driver_instructions?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      captain_locations: {
        Row: {
          id: string;
          captain_id: string;
          latitude: number;
          longitude: number;
          heading: number;
          speed: number;
          is_online: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          captain_id: string;
          latitude: number;
          longitude: number;
          heading?: number;
          speed?: number;
          is_online?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          captain_id?: string;
          latitude?: number;
          longitude?: number;
          heading?: number;
          speed?: number;
          is_online?: boolean;
          updated_at?: string;
        };
      };
      captain_settlements: {
        Row: {
          id: string;
          captain_id: string;
          amount_returned: number;
          previous_balance: number;
          new_balance: number;
          breakdown: Json;
          payment_method: string;
          received_by: string | null;
          reference_code: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          captain_id: string;
          amount_returned: number;
          previous_balance?: number;
          new_balance?: number;
          breakdown?: Json;
          payment_method: string;
          received_by?: string | null;
          reference_code?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          captain_id?: string;
          amount_returned?: number;
          previous_balance?: number;
          new_balance?: number;
          breakdown?: Json;
          payment_method?: string;
          received_by?: string | null;
          reference_code?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          business_id: string | null;
          title: string | null;
          content: string;
          content_ku: string | null;
          content_ar: string | null;
          content_en: string | null;
          images: string[];
          tags: string[];
          category: string;
          likes_count: number;
          comments_count: number;
          shares_count: number;
          views_count: number;
          location_name: string | null;
          status: string;
          product_id: string | null;
          deal: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id?: string | null;
          title?: string | null;
          content: string;
          content_ku?: string | null;
          content_ar?: string | null;
          content_en?: string | null;
          images?: string[];
          tags?: string[];
          category?: string;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          views_count?: number;
          location_name?: string | null;
          status?: string;
          product_id?: string | null;
          deal?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_id?: string | null;
          title?: string | null;
          content?: string;
          content_ku?: string | null;
          content_ar?: string | null;
          content_en?: string | null;
          images?: string[];
          tags?: string[];
          category?: string;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          views_count?: number;
          location_name?: string | null;
          status?: string;
          product_id?: string | null;
          deal?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          business_id: string | null;
          media_url: string;
          title: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id?: string | null;
          media_url: string;
          title?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_id?: string | null;
          media_url?: string;
          title?: string | null;
          expires_at?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          pending_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          pending_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          pending_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallet_transactions: {
        Row: {
          id: string;
          wallet_id: string;
          amount: number;
          type: string;
          reference_type: string | null;
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          amount: number;
          type: string;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          amount?: number;
          type?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
