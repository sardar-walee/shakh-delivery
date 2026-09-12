export interface PricePoint {
  date: string; // e.g. 'Aug 14' or '08/14'
  formattedDate: string; // localized string
  timestamp: number; // Unix timestamp
  price: number; // in IQD
  originalPrice?: number;
  discountPercent?: number;
  note?: string; // e.g. 'Flash Sale', 'Weekend Promo', 'Supplier Price Drop'
  event?: 'discount' | 'price_drop' | 'normal' | 'price_hike' | 'lowest';
}

export type DealVerdict = 'best_deal' | 'good_price' | 'fair_price' | 'above_average';

export interface PriceTrendSummary {
  currentPrice: number;
  startPrice30d: number;
  lowestPrice30d: number;
  highestPrice30d: number;
  averagePrice30d: number;
  priceChange30d: number; // currentPrice - startPrice30d
  priceChangePercent30d: number; // percentage change
  savingsVsHighest: number; // highestPrice30d - currentPrice
  savingsPercentVsHighest: number;
  isLowestIn30Days: boolean;
  verdict: DealVerdict;
  volatility: 'low' | 'moderate' | 'high';
  history: PricePoint[];
}

export interface TrackedProduct {
  id: string;
  name: string;
  name_ku?: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  description_ku?: string;
  description_ar?: string;
  category: 'food' | 'supermarket' | 'fashion' | 'beauty' | 'tech' | 'cars' | 'umrah' | 'general';
  price: number;
  original_price?: number;
  discount_percent?: number;
  image: string;
  images?: string[];
  in_stock: boolean;
  stock_count?: number;
  rating: number;
  reviews_count: number;
  store_id?: string;
  store_name: string;
  store_avatar?: string;
  store_location?: string;
  store_verified?: boolean;
  delivery_time_mins?: number;
  delivery_fee?: number;
  tags?: string[];
  specs?: { label: string; value: string }[];
  custom_price_history?: PricePoint[];
}
