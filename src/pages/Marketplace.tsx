import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Store,
  Star,
  MapPin,
  Search,
  Navigation,
  Compass,
  RefreshCw,
  ChevronDown,
  Flame,
  LayoutGrid,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  Tag,
  Package,
  LineChart as ChartIcon,
  ShieldCheck,
  Check,
  X,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { Database } from '../types/database.types';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLocationStore } from '../store/useLocationStore';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { TrackedProduct } from '../types/priceTrend';
import SocialFeed from '../components/social/SocialFeed';
import { formatIQD } from '../utils/priceTrendUtils';

// Multi-lingual keywords for matching categories in search
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: [
    'food', 'restaurant', 'restaurants', 'خواردن', 'چێشتخانە', 'مطعم', 'مطاعم', 'طعام',
    'pizza', 'burger', 'پیتزا', 'بەرگر', 'کەباب', 'خواردەمەنی', 'شەاورما', 'shawarma', 'fast food', 'meal'
  ],
  supermarket: [
    'supermarket', 'supermarkets', 'grocery', 'groceries', 'market', 'مارکێت', 'سوپەرمارکێت',
    'بقالة', 'سوبرماركت', 'خۆراک', 'برنج', 'زەیت', 'شیر', 'ئاوی میوە', 'rice', 'oil', 'milk'
  ],
  tech: [
    'tech', 'electronics', 'phone', 'mobile', 'laptop', 'تەکنەلۆژیا', 'ئەلیکترۆنیات', 'مۆبایل',
    'الكترونيات', 'هواتف', 'ئایفۆن', 'سامسۆنگ', 'iphone', 'samsung', 'headphone', 'airpods', 'apple'
  ],
  fashion: [
    'fashion', 'clothes', 'clothing', 'shoes', 'جلوبەرگ', 'پۆشاک', 'ملابس', 'أزياء', 'موضة',
    'بەرگ', 'کەوا', 'پانتۆڵ', 'تیشێرت', 't-shirt', 'shirt', 'dress'
  ],
  beauty: [
    'beauty', 'cosmetics', 'perfume', 'makeup', 'میکیاج', 'جوانی', 'عطور', 'مكياج', 'تجميل',
    'بۆن', 'عەتر', 'کرێم', 'سوراڤ', 'lipstick', 'fragrance'
  ],
  cars: ['car', 'cars', 'auto', 'ئۆتۆمبێل', 'سەیارە', 'سیارات'],
  umrah: ['umrah', 'travel', 'عومرە', 'گەشت', 'عمرة', 'سياحة'],
};

interface BusinessItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  logo: string | null;
  cover_image: string | null;
  status: string;
  is_open: boolean;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  commission_rate?: number;
  rating?: number;
  distance?: number | null;
}

export default function Marketplace() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ku' || i18n.language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const initialTab = searchParams.get('tab') as 'products' | 'stores' | 'social' | null;
  const productParam = searchParams.get('product');

  const { products, openProductModal } = useProductStore();
  const { addItem } = useCartStore();
  
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByNearest, setSortByNearest] = useState(true);
  const [onlyNearby, setOnlyNearby] = useState(false);
  const [viewMode, setViewMode] = useState<'products' | 'stores' | 'social'>(initialTab || 'products');

  const handleClearAllFilters = () => {
    setSearchQuery('');
    if (categoryFilter) {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  // Handle deep-linked product URL parameter
  useEffect(() => {
    if (productParam) {
      openProductModal(productParam);
    }
  }, [productParam, openProductModal]);

  const {
    coordinates,
    city,
    loading: geoLoading,
    error: geoError,
    requestLocation,
    calculateDistance,
    formatDistance,
  } = useGeolocation();

  const { currentLocation, openModal } = useLocationStore();

  // Effective user coordinates: GPS or selected city coordinates
  const activeUserCoords = useMemo(() => {
    if (coordinates) return coordinates;
    if (currentLocation?.latitude && currentLocation?.longitude) {
      return { latitude: currentLocation.latitude, longitude: currentLocation.longitude };
    }
    return null;
  }, [coordinates, currentLocation]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        let fetchedData: BusinessItem[] = [];

        // Attempt 1: Try querying 'businesses'
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*');

        if (!bizError && bizData && bizData.length > 0) {
          fetchedData = bizData.map((b: any) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            type: b.type || 'RESTAURANT',
            logo: b.logo,
            cover_image: b.cover_image,
            status: b.status || 'active',
            is_open: b.is_open ?? true,
            latitude: b.latitude ? Number(b.latitude) : 36.1911,
            longitude: b.longitude ? Number(b.longitude) : 44.0092,
            address: b.address || 'Erbil',
            commission_rate: b.commission_rate ?? 10,
            rating: b.rating ?? 4.8,
          }));
        } else {
          // Attempt 2: Fallback to 'restaurants' table in Supabase
          const { data: restData, error: restError } = await supabase
            .from('restaurants')
            .select('*');

          if (!restError && restData && restData.length > 0) {
            fetchedData = restData.map((r: any) => {
              let type = 'RESTAURANT';
              const nameLower = (r.name || '').toLowerCase();
              if (nameLower.includes('supermarket') || nameLower.includes('market')) type = 'SUPERMARKET';
              else if (nameLower.includes('fashion') || nameLower.includes('boutique')) type = 'FASHION';
              else if (nameLower.includes('beauty') || nameLower.includes('perfume')) type = 'BEAUTY';
              else if (nameLower.includes('umrah') || nameLower.includes('travel')) type = 'UMRAH';
              else if (nameLower.includes('motor') || nameLower.includes('car')) type = 'CAR';

              return {
                id: r.id,
                name: r.name,
                description: r.description,
                type,
                logo: r.logo,
                cover_image: r.cover_image,
                status: r.active ? 'active' : 'inactive',
                is_open: r.active ?? true,
                latitude: r.latitude ? Number(r.latitude) : 36.1911,
                longitude: r.longitude ? Number(r.longitude) : 44.0092,
                address: r.address || 'Erbil, Kurdistan',
                commission_rate: r.commission_value ? Number(r.commission_value) : 10,
                rating: r.rating ? Number(r.rating) : 4.8,
              };
            });
          }
        }

        // Apply category filter if specified
        if (categoryFilter && categoryFilter !== 'all') {
          fetchedData = fetchedData.filter(
            (b) => b.type.toUpperCase() === categoryFilter.toUpperCase()
          );
        }

        setBusinesses(fetchedData);
      } catch (err) {
        console.warn('Businesses loading note:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [categoryFilter]);

  // Compute businesses with distance, search filtering, and sorting
  const processedBusinesses = useMemo(() => {
    let list = businesses.map((b) => {
      // Default coordinates fallback if business has no latitude/longitude recorded yet
      const bLat = b.latitude ?? 36.1911;
      const bLon = b.longitude ?? 44.0092;
      
      let distance: number | null = null;
      if (activeUserCoords) {
        const dLat = ((bLat - activeUserCoords.latitude) * Math.PI) / 180;
        const dLon = ((bLon - activeUserCoords.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((activeUserCoords.latitude * Math.PI) / 180) *
            Math.cos((bLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }

      return {
        ...b,
        distance,
      };
    });

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          (b.address && b.address.toLowerCase().includes(q)) ||
          b.type.toLowerCase().includes(q)
      );
    }

    // Filter only nearby (< 25km) if toggled
    if (onlyNearby && activeUserCoords) {
      list = list.filter((b) => b.distance !== null && b.distance <= 25);
    }

    // Sort by nearest if enabled and location available
    if (sortByNearest && activeUserCoords) {
      list.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return list;
  }, [businesses, activeUserCoords, searchQuery, onlyNearby, sortByNearest]);

  // Filter products by search and category in real-time
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Explicit category filter from tabs or dropdown
    if (categoryFilter && categoryFilter !== 'all') {
      const catNorm = categoryFilter.toLowerCase();
      list = list.filter((p) => {
        if (catNorm === 'restaurants' || catNorm === 'food') return p.category === 'food';
        if (catNorm === 'supermarkets' || catNorm === 'market') return p.category === 'supermarket';
        if (catNorm === 'fashion') return p.category === 'fashion';
        if (catNorm === 'beauty') return p.category === 'beauty';
        if (catNorm === 'cars') return p.category === 'cars';
        if (catNorm === 'umrah') return p.category === 'umrah';
        if (catNorm === 'tech') return p.category === 'tech';
        return p.category.toLowerCase().includes(catNorm);
      });
    }

    // Real-time input search query filtering by product name, category, localized names, tags, store, or description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        // Name matching (English, Kurdish, Arabic, etc.)
        const nameMatch =
          p.name.toLowerCase().includes(q) ||
          (p.name_ku && p.name_ku.toLowerCase().includes(q)) ||
          (p.name_ar && p.name_ar.toLowerCase().includes(q)) ||
          (p.name_en && p.name_en.toLowerCase().includes(q));

        // Direct category matching (e.g. 'food', 'supermarket', 'tech')
        const directCatMatch = p.category.toLowerCase().includes(q);

        // Keyword & synonym category matching (e.g. 'خواردن' or 'مارکێت' or 'مۆبایل')
        const synonymCatMatch = Object.entries(CATEGORY_KEYWORDS).some(([catKey, keywords]) => {
          if (p.category === catKey) {
            return keywords.some((kw) => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()));
          }
          return false;
        });

        // Description matching
        const descMatch =
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.description_ku && p.description_ku.toLowerCase().includes(q)) ||
          (p.description_ar && p.description_ar.toLowerCase().includes(q));

        // Store name matching
        const storeMatch = p.store_name.toLowerCase().includes(q);

        // Tags matching
        const tagMatch = p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q));

        return nameMatch || directCatMatch || synonymCatMatch || descMatch || storeMatch || tagMatch;
      });
    }

    return list;
  }, [products, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Geolocation City Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {t('marketplace')}
            </h1>
            {city && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                <MapPin className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                {city}
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {city
              ? `${t('nearby_stores')} in and around ${city}`
              : categoryFilter
              ? `Showing ${categoryFilter} options`
              : 'Discover stores, restaurants, and services near you'}
          </p>
        </div>
        
        {/* Search & Location Trigger */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <div className="absolute inset-y-0 start-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field py-2 pl-10 pr-9 rtl:pl-9 rtl:pr-10 text-sm w-full"
              placeholder={t('search_placeholder')}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={isRtl ? 'سڕینەوەی دەق' : 'Clear search'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 text-xs font-semibold max-w-[160px] truncate"
            title="گۆڕینی شار یان شوێن / Change Location"
          >
            <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
            <span className="truncate">{currentLocation.governorateName || 'Erbil'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          <button
            onClick={requestLocation}
            disabled={geoLoading}
            title={coordinates ? `Current city: ${city || 'Detected'}` : 'Detect Location (GPS)'}
            className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            {geoLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
            ) : (
              <Compass className={`w-4 h-4 ${coordinates ? 'text-primary-600' : 'text-slate-400'}`} />
            )}
          </button>
        </div>
      </div>

      {/* View Mode Switcher: Products & Price Trends vs Stores vs Social Feed */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-xl">
        <button
          type="button"
          onClick={() => setViewMode('products')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'products'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ChartIcon className="w-4 h-4 text-primary-600" />
          <span>{t('products_trends', 'کاڵاکان و چاودێری نرخ')}</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('stores')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'stores'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4 text-emerald-600" />
          <span>{t('stores_directory', 'دوکانەکان')}</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('social')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'social'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500" />
          <span>{t('social_posts', 'ئۆفەری سۆشیال')}</span>
        </button>
      </div>

      {viewMode === 'social' ? (
        <SocialFeed />
      ) : viewMode === 'products' ? (
        <div className="space-y-6">
          {/* Real-time Product Search & Category Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary-600" />
                  <span>{isRtl ? 'گەڕان لە کاڵاکان بەپێی ناو و پۆلێن' : 'Search Products & Categories'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl
                    ? 'فلتەرکردنی دەستبەجێ بەپێی ناوی کاڵا، جۆر، یان پۆلێن بە شێوازی ڕاستەوخۆ'
                    : 'Real-time filtering by product title, brand, category, or store as you type'}
                </p>
              </div>

              {/* Dynamic Match Count Badge & Reset Button */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 flex items-center gap-1.5 shadow-2xs">
                  <Package className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  <span>
                    {isRtl
                      ? `${filteredProducts.length} کاڵا دۆزرایەوە`
                      : `${filteredProducts.length} items found`}
                  </span>
                </span>
                {(searchQuery || (categoryFilter && categoryFilter !== 'all')) && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1"
                    title={isRtl ? 'سڕینەوەی فلتەرەکان' : 'Reset search & filters'}
                  >
                    <X className="w-3 h-3" />
                    <span>{isRtl ? 'سڕینەوە' : 'Reset'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Search Input & Integrated Category Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Main Real-time Search Input Field */}
              <div className="relative sm:col-span-8 lg:col-span-9">
                <div className="absolute inset-y-0 start-0 pl-3.5 rtl:pr-3.5 rtl:pl-0 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="marketplace-products-live-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isRtl
                      ? 'ناوی کاڵاکە بنووسە یان پۆلێن (نموونە: بەرگر، پیتزا، مارکێت، ئایفۆن، تیشێرت)...'
                      : 'Search by product name or category (e.g., burger, pizza, tech, supermarket)...'
                  }
                  className="w-full py-2.5 pl-10 pr-10 rtl:pl-10 rtl:pr-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 end-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={isRtl ? 'سڕینەوە' : 'Clear search text'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Dropdown Select */}
              <div className="relative sm:col-span-4 lg:col-span-3">
                <select
                  id="marketplace-category-select"
                  value={categoryFilter || 'all'}
                  onChange={(e) => {
                    const cat = e.target.value;
                    if (cat === 'all') {
                      searchParams.delete('category');
                      setSearchParams(searchParams);
                    } else {
                      setSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat });
                    }
                  }}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3.5 pe-8 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 cursor-pointer transition-all truncate"
                >
                  <option value="all">{isRtl ? 'هەموو پۆلێنەکان' : 'All Categories'}</option>
                  <option value="food">{isRtl ? '🍕 چێشتخانە و خواردن' : '🍕 Restaurants & Food'}</option>
                  <option value="supermarket">{isRtl ? '🛒 مارکێت و خۆراک' : '🛒 Groceries & Supermarket'}</option>
                  <option value="tech">{isRtl ? '📱 تەکنەلۆژیا و مۆبایل' : '📱 Tech & Electronics'}</option>
                  <option value="fashion">{isRtl ? '👔 جلوبەرگ و پۆشاک' : '👔 Fashion & Clothing'}</option>
                  <option value="beauty">{isRtl ? '💄 میکیاج و جوانی' : '💄 Beauty & Cosmetics'}</option>
                  <option value="cars">{isRtl ? '🚗 ئۆتۆمبێل' : '🚗 Cars & Auto'}</option>
                  <option value="umrah">{isRtl ? '🕋 عومرە و گەشت' : '🕋 Umrah & Travel'}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1 me-1 text-[11px]">
                <Tag className="w-3 h-3" />
                <span>{isRtl ? 'پێشنیارەکان:' : 'Suggestions:'}</span>
              </span>
              {[
                { label: isRtl ? '🍕 خواردن' : '🍕 Food', q: 'food' },
                { label: isRtl ? '🛒 مارکێت' : '🛒 Supermarket', q: 'supermarket' },
                { label: isRtl ? '📱 مۆبایل و تەکنەلۆژیا' : '📱 Tech', q: 'tech' },
                { label: isRtl ? '👔 جلوبەرگ' : '👔 Fashion', q: 'fashion' },
                { label: isRtl ? '💄 جوانی' : '💄 Beauty', q: 'beauty' },
                { label: isRtl ? '🍔 بەرگر' : 'Burger', q: 'burger' },
                { label: isRtl ? '🍕 پیتزا' : 'Pizza', q: 'pizza' },
                { label: isRtl ? '📱 ئایفۆن' : 'iPhone', q: 'iphone' },
                { label: isRtl ? '🍚 برنج' : 'Rice', q: 'rice' },
              ].map((chip) => {
                const isSelected = searchQuery.toLowerCase() === chip.q.toLowerCase();
                return (
                  <button
                    key={chip.q}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSearchQuery('');
                      } else {
                        setSearchQuery(chip.q);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {['all', 'food', 'supermarket', 'tech', 'fashion', 'beauty'].map((cat) => {
                const isActive = categoryFilter === cat || (!categoryFilter && cat === 'all');
                return (
                  <button
                    key={cat}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => {
                      if (cat === 'all') {
                        searchParams.delete('category');
                        setSearchParams(searchParams);
                      } else {
                        setSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat });
                      }
                    }}
                  >
                    {cat === 'all'
                      ? 'All Products'
                      : cat === 'food'
                      ? '🍕 Restaurants & Food'
                      : cat === 'supermarket'
                      ? '🛒 Groceries & Supermarket'
                      : cat === 'tech'
                      ? '📱 Tech & Electronics'
                      : cat === 'fashion'
                      ? '👔 Fashion'
                      : '💄 Beauty'}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              <span>Showing {filteredProducts.length} tracked items</span>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product) => {
                const hasDiscount = !!product.discount_percent || (product.original_price && product.original_price > product.price);
                const discount = product.discount_percent || (product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0);

                return (
                  <div
                    key={product.id}
                    className="card p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Image & Badges */}
                    <div
                      onClick={() => openProductModal(product)}
                      className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                        {hasDiscount ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-sm flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            <span>{discount}% OFF</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white">
                            {product.category}
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>{product.rating}</span>
                        </span>
                      </div>

                      {/* Store pill at bottom of image */}
                      <div className="absolute bottom-2.5 start-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-semibold">
                        <img
                          src={product.store_avatar}
                          alt={product.store_name}
                          className="w-4 h-4 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="truncate max-w-[130px]">{product.store_name}</span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div
                        onClick={() => openProductModal(product)}
                        className="cursor-pointer space-y-1.5"
                      >
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Pricing & 30-Day Analysis Trigger */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="font-mono font-black text-base text-primary-600 dark:text-primary-400">
                              {formatIQD(product.price)}
                            </span>
                            {product.original_price && (
                              <span className="ms-2 font-mono text-xs text-slate-400 line-through">
                                {formatIQD(product.original_price)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {/* Interactive Buttons: Price Trend & Add to Cart */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openProductModal(product)}
                            className="w-full py-2 px-2.5 rounded-xl border border-primary-200 dark:border-primary-800/60 bg-primary-50/50 hover:bg-primary-100/70 dark:bg-primary-950/40 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                            title="View interactive 30-day Recharts price fluctuation graph"
                          >
                            <ChartIcon className="w-3.5 h-3.5 text-primary-600" />
                            <span>30D Trend</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              addItem(
                                {
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  original_price: product.original_price,
                                  image: product.image,
                                  storeName: product.store_name,
                                },
                                1,
                                true
                              );
                            }}
                            className="w-full py-2 px-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isRtl ? 'هیچ کاڵایەک نەدۆزرایەوە' : 'No products found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? isRtl
                    ? `هیچ کاڵایەک نەدۆزرایەوە بۆ «${searchQuery}». تکایە بە ناوێکی تر یان پۆلێنێکی تر وەک خواردن، مارکێت، یان تەکنەلۆژیا بگەڕێ.`
                    : `No items matched "${searchQuery}". Try searching by another product name or category (e.g. food, supermarket, tech).`
                  : isRtl
                  ? 'تکایە پۆلێنەکە بگۆڕە یان فلتەرەکان پاکبکەرەوە.'
                  : 'Try switching the category or clearing active filters.'}
              </p>
              {(searchQuery || (categoryFilter && categoryFilter !== 'all')) && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'سڕینەوەی فلتەر و گەڕان' : 'Clear Search & Filters'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Geolocation Notice Banner if location disabled */}
          {geoError && !coordinates && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-sm">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Enable browser location to view exact distances and find the closest stores.</span>
              </div>
              <button
                onClick={requestLocation}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-200/80 dark:bg-amber-800/80 hover:bg-amber-300 transition-colors"
              >
                {t('enable_location')}
              </button>
            </div>
          )}

      {/* Category Tabs & Nearby Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {['all', 'restaurants', 'supermarkets', 'fashion', 'beauty', 'umrah', 'cars'].map((cat) => {
            const isActive = categoryFilter === cat || (!categoryFilter && cat === 'all');
            return (
              <button
                key={cat}
                className={`px-3.5 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => {
                  if (cat === 'all') {
                    searchParams.delete('category');
                    setSearchParams(searchParams);
                  } else {
                    setSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat });
                  }
                }}
              >
                {t(cat === 'all' ? 'All' : cat)}
              </button>
            );
          })}
        </div>

        {/* Quick Toggles: Nearest / Nearby */}
        {coordinates && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setOnlyNearby(!onlyNearby)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                onlyNearby
                  ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>Nearby (&lt; 25km)</span>
            </button>

            <button
              onClick={() => setSortByNearest(!sortByNearest)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                sortByNearest
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span>{t('nearest')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-0 animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-800"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : processedBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedBusinesses.map((business) => (
            <div 
              key={business.id} 
              className="card p-0 overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {business.cover_image ? (
                    <img 
                      src={business.cover_image} 
                      alt={business.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <Store className="w-12 h-12" />
                    </div>
                  )}

                  {/* Distance Badge */}
                  {business.distance !== null && (
                    <div className="absolute bottom-2.5 start-2.5 bg-black/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <Navigation className="w-3 h-3 text-primary-400" />
                      <span>{formatDistance(business.distance)}</span>
                    </div>
                  )}

                  {!business.is_open && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-rose-600 text-white font-bold px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wide">
                        Closed
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">
                      {business.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md shrink-0 border border-amber-200 dark:border-amber-900/60">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold">4.9</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mt-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{business.address || city || 'Erbil'}</span>
                    </div>
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                      {business.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Store className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No businesses found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            {onlyNearby
              ? 'No stores found within 25km of your location. Try turning off the nearby filter or selecting another category.'
              : 'Try adjusting your search keywords or switching to a different category.'}
          </p>
          {onlyNearby && (
            <button
              onClick={() => setOnlyNearby(false)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Show all stores
            </button>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}

