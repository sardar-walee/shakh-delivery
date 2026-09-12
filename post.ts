export interface PostAuthor {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  type: 'restaurant' | 'market' | 'fashion' | 'beauty' | 'store' | 'user' | 'official';
  phone?: string;
  location?: string;
  badge?: string;
}

export interface PostProduct {
  id: string;
  name: string;
  name_ku?: string;
  name_ar?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  image: string;
  in_stock: boolean;
}

export interface PostComment {
  id: string;
  user_name: string;
  user_avatar?: string;
  user_badge?: string;
  content: string;
  created_at: string;
  likes_count: number;
  is_liked?: boolean;
}

export interface PostStory {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  media_url: string;
  title: string;
  has_unread: boolean;
  expires_at: string;
}

export interface FashionDetails {
  gender: 'men' | 'women' | 'kids' | 'unisex';
  colors: string[];
  sizes: string[];
  fabric?: string;
  condition?: 'new' | 'used';
  season?: string;
}

export interface CarDetails {
  make: string; // Brand e.g. Toyota, Mercedes, BMW
  model: string; // Model name e.g. Land Cruiser, Camry
  year: number; // e.g. 2024
  mileage_km: number; // e.g. 15000
  gear: 'automatic' | 'manual';
  fuel: 'petrol' | 'hybrid' | 'diesel' | 'electric';
  cylinders?: number; // 4, 6, 8
  plate_city: string; // Erbil, Sulaymaniyah, Duhok, Baghdad...
  condition_status: string; // Clean / No paint, 1 piece, etc.
  price_iqd?: number; // Price in IQD
  engine_size?: string;
  color?: string;
}

export interface TechDetails {
  brand: string;
  model: string;
  storage?: string;
  ram?: string;
  condition?: 'new' | 'used';
  warranty?: string;
}

export interface FoodDetails {
  meal_type?: string;
  spicy_level?: 'mild' | 'medium' | 'spicy';
  prep_time_min?: number;
  is_halal?: boolean;
}

export interface SupermarketDetails {
  weight_volume?: string;
  expiry_date?: string;
  is_organic?: boolean;
}

export interface Post {
  id: string;
  author: PostAuthor;
  title?: string;
  content: string;
  content_ku?: string;
  content_ar?: string;
  content_en?: string;
  images: string[];
  tags: string[];
  category: 'all' | 'food' | 'offers' | 'market' | 'fashion' | 'beauty' | 'cars' | 'tech';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_liked?: boolean;
  created_at: string;
  location_name?: string;
  status?: 'pending' | 'approved' | 'rejected';
  product?: PostProduct;
  deal?: {
    discount_label: string;
    code?: string;
    expires_at?: string;
  };
  fashion_details?: FashionDetails;
  car_details?: CarDetails;
  tech_details?: TechDetails;
  food_details?: FoodDetails;
  supermarket_details?: SupermarketDetails;
  comments: PostComment[];
}

export type SocialPlatform =
  | 'whatsapp'
  | 'facebook'
  | 'telegram'
  | 'viber'
  | 'x'
  | 'instagram'
  | 'messenger'
  | 'copy_link'
  | 'native_share';
