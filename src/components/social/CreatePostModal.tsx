import React, { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Image as ImageIcon,
  Tag,
  ShoppingBag,
  Sparkles,
  Plus,
  Check,
  Crown,
  ShieldCheck,
  Car,
  Shirt,
  Utensils,
  Smartphone,
  Lock,
  ChevronDown,
  Info,
  DollarSign,
  Palette,
  Maximize2,
  Calendar,
  Gauge,
  Layers,
  Fuel,
  MapPin,
  CheckCircle2,
  Camera,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import { useSocialStore } from '../../store/useSocialStore';
import { useAuthStore, ALL_SYSTEM_ROLES } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { FashionDetails, CarDetails, TechDetails, FoodDetails } from '../../types/post';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Popular car brands for IQ Cars
const POPULAR_CAR_MAKES = [
  'Toyota',
  'Mercedes-Benz',
  'BMW',
  'Hyundai',
  'Kia',
  'Nissan',
  'Lexus',
  'Ford',
  'Chevrolet',
  'Audi',
  'Range Rover',
  'Jeep',
  'Dodge',
  'Haval',
  'MG',
  'Volkswagen',
];

// Car plate cities in Iraq/Kurdistan
const PLATE_CITIES = [
  'هەولێر (Erbil)',
  'سلێمانی (Sulaymaniyah)',
  'دهۆک (Duhok)',
  'کەرکووک (Kirkuk)',
  'بەغداد (Baghdad)',
  'فەحص کاتی / بێ تابلۆ',
];

// Color palette options with hex values & Kurdish labels
const FASHION_COLORS = [
  { name: 'ڕەش', hex: '#0f172a' },
  { name: 'سپی', hex: '#f8fafc', border: true },
  { name: 'شین', hex: '#1e3a8a' },
  { name: 'بێج', hex: '#d4b996' },
  { name: 'سوور', hex: '#dc2626' },
  { name: 'سەوز', hex: '#15803d' },
  { name: 'زەرد', hex: '#ca8a04' },
  { name: 'قاوەیی', hex: '#78350f' },
  { name: 'ڕەساسی', hex: '#64748b' },
  { name: 'پەمەیی', hex: '#db2777' },
  { name: 'مۆر', hex: '#7e22ce' },
];

const FASHION_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '36', '38', '40', '42', '44', 'Free Size'];

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';
  const { createPost } = useSocialStore();
  const { user, activeRole, setActiveRole } = useAuthStore();

  // Basic Post State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'offers' | 'food' | 'market' | 'fashion' | 'beauty' | 'cars' | 'tech'>('fashion');
  
  // Image Upload State (From Gallery or Camera - No URL link needed!)
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [discountLabel, setDiscountLabel] = useState('');
  const [tagsInput, setTagsInput] = useState('#شاخ_ستۆر, #کوردستان');

  // Role Switcher Drawer
  const [showRoleTester, setShowRoleTester] = useState(false);

  // Clothing (Fashion) Specific Fields
  const [fashionGender, setFashionGender] = useState<'men' | 'women' | 'kids' | 'unisex'>('men');
  const [selectedColors, setSelectedColors] = useState<string[]>(['ڕەش', 'شین']);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [fashionFabric, setFashionFabric] = useState('لۆکەی ١٠٠٪ (Cotton)');
  const [fashionCondition, setFashionCondition] = useState<'new' | 'used'>('new');
  const [customColor, setCustomColor] = useState('');

  // Car (IQ Cars) Specific Fields
  const [carMake, setCarMake] = useState('Toyota');
  const [carModel, setCarModel] = useState('Camry');
  const [carYear, setCarYear] = useState<number>(2024);
  const [carMileage, setCarMileage] = useState<number>(18000);
  const [carGear, setCarGear] = useState<'automatic' | 'manual'>('automatic');
  const [carFuel, setCarFuel] = useState<'petrol' | 'hybrid' | 'diesel' | 'electric'>('petrol');
  const [carCylinders, setCarCylinders] = useState<number>(4);
  const [carPlateCity, setCarPlateCity] = useState('هەولێر (Erbil)');
  const [carConditionStatus, setCarConditionStatus] = useState('بێ بۆیاخ و بێ لێدراو (پاک)');
  const [carPriceIqd, setCarPriceIqd] = useState<string>('30000000');
  const [carColor, setCarColor] = useState('سپی سەدەفی');

  // Tech Specific Fields
  const [techBrand, setTechBrand] = useState('Apple');
  const [techModel, setTechModel] = useState('iPhone 16 Pro Max');
  const [techStorage, setTechStorage] = useState('256GB');
  const [techRam, setTechRam] = useState('8GB');

  // Food Specific Fields
  const [foodMealType, setFoodMealType] = useState('خوانی سەرەکی');
  const [foodSpicyLevel, setFoodSpicyLevel] = useState<'mild' | 'medium' | 'spicy'>('mild');
  const [foodPrepTime, setFoodPrepTime] = useState<number>(20);

  // Cars Advertising Fees
  const [carAdDuration, setCarAdDuration] = useState<'1_month' | '15_days' | '1_week'>('1_month');

  const getCarAdPrice = (duration: string) => {
    switch (duration) {
      case '1_month': return 5000;
      case '15_days': return 3750;
      case '1_week': return 2750;
      default: return 5000;
    }
  };

  // Determine role posting authorization
  const isSuperAdmin = !activeRole || activeRole === 'SUPER_ADMIN' || activeRole.includes('ADMIN');

  // Strict role authority: each role only posts in their allowed category, plus everyone can post cars!
  const getRoleAllowedCategories = (role: string | null): string[] => {
    if (!role || role === 'SUPER_ADMIN' || role.includes('ADMIN')) {
      return ['fashion', 'cars', 'food', 'market', 'tech', 'offers', 'beauty'];
    }
    if (role === 'FASHION_MERCHANT') return ['fashion', 'cars'];
    if (role === 'CARS_MERCHANT') return ['cars'];
    if (role === 'FOOD_MERCHANT') return ['food', 'cars'];
    if (role === 'MARKET_MERCHANT') return ['market', 'cars'];
    if (role === 'TECH_MERCHANT') return ['tech', 'cars'];
    return ['offers', 'cars'];
  };

  // Automatically switch active category to the role's authorized domain
  React.useEffect(() => {
    if (activeRole === 'FASHION_MERCHANT') {
      setCategory('fashion');
    } else if (activeRole === 'CARS_MERCHANT') {
      setCategory('cars');
    } else if (activeRole === 'FOOD_MERCHANT') {
      setCategory('food');
    } else if (activeRole === 'MARKET_MERCHANT') {
      setCategory('market');
    } else if (activeRole === 'TECH_MERCHANT') {
      setCategory('tech');
    }
  }, [activeRole]);

  const allowedCategories = getRoleAllowedCategories(activeRole);
  const canPostInCurrentCategory = isSuperAdmin || allowedCategories.includes(category);

  // Handle image files from Gallery or Camera
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsReadingImage(true);
    const readers: Promise<string>[] = [];

    Array.from(files).forEach((file) => {
      readers.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        })
      );
    });

    Promise.all(readers).then((results) => {
      setUploadedImages((prev) => [...prev, ...results]);
      setIsReadingImage(false);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  if (!isOpen) return null;

  // Toggle helpers
  const toggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
      setSelectedColors([...selectedColors, customColor.trim()]);
      setCustomColor('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!canPostInCurrentCategory) {
      alert(
        isRtl
          ? 'تەنها پلاتفۆرمی شاخ دەسەڵاتی بڵاوکردنەوەی هەموو بەشەکانی هەیە. ئەم ڕۆڵە دەسەڵاتی ئەم بەشەی نییە.'
          : 'Only SHAKH Platform has permission across all categories. This role cannot post here.'
      );
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    // Build specific category metadata
    let fashion_details: FashionDetails | undefined;
    let car_details: CarDetails | undefined;
    let tech_details: TechDetails | undefined;
    let food_details: FoodDetails | undefined;

    if (category === 'fashion') {
      fashion_details = {
        gender: fashionGender,
        colors: selectedColors,
        sizes: selectedSizes,
        fabric: fashionFabric,
        condition: fashionCondition,
      };
    } else if (category === 'cars') {
      car_details = {
        make: carMake,
        model: carModel,
        year: Number(carYear),
        mileage_km: Number(carMileage),
        gear: carGear,
        fuel: carFuel,
        cylinders: carCylinders,
        plate_city: carPlateCity,
        condition_status: carConditionStatus,
        price_iqd: carPriceIqd ? Number(carPriceIqd) : undefined,
        color: carColor,
      };
    } else if (category === 'tech') {
      tech_details = {
        brand: techBrand,
        model: techModel,
        storage: techStorage,
        ram: techRam,
      };
    } else if (category === 'food') {
      food_details = {
        meal_type: foodMealType,
        spicy_level: foodSpicyLevel,
        prep_time_min: Number(foodPrepTime),
        is_halal: true,
      };
    }

    // Resolve final images: use uploaded images from gallery/camera or clean category default
    let finalImages = [...uploadedImages];
    if (finalImages.length === 0) {
      if (category === 'cars') {
        finalImages = ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=900&auto=format&fit=crop&q=80'];
      } else if (category === 'fashion') {
        finalImages = ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop&q=80'];
      } else if (category === 'food') {
        finalImages = ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80'];
      } else if (category === 'tech') {
        finalImages = ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=80'];
      } else {
        finalImages = ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop&q=80'];
      }
    }
    const coverImage = finalImages[0];

    // Author identity based on current role
    let authorName = 'شاخ ستۆر (SHAKH Store Platform)';
    let authorType: 'store' | 'user' | 'driver' = 'store';

    if (activeRole === 'FASHION_MERCHANT') {
      authorName = 'فرۆشگای جل و بەرگ (Fashion Store)';
    } else if (activeRole === 'CARS_MERCHANT') {
      authorName = user?.user_metadata?.showroom_name || user?.user_metadata?.full_name || 'IQ Cars Showroom';
    } else if (activeRole === 'FOOD_MERCHANT') {
      authorName = 'چێشتخانە و فاست فوودی شاخ';
    } else if (activeRole === 'MARKET_MERCHANT') {
      authorName = 'سوپەرمارکێتی شاخ';
    } else if (activeRole === 'TECH_MERCHANT') {
      authorName = 'فرۆشگای تەکنەلۆژیا و مۆبایلی شاخ';
    } else {
      authorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'بەکارهێنەر (User)';
      authorType = 'user';
    }

    createPost({
      title: title.trim() || undefined,
      content: content.trim(),
      content_ku: content.trim(),
      content_ar: content.trim(),
      content_en: content.trim(),
      category,
      images: finalImages,
      tags: parsedTags,
      author: {
        id: user?.id || 'shakh-author',
        name: authorName,
        avatar: isSuperAdmin
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
          : category === 'cars'
          ? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        verified: true,
        type: authorType,
        location: isRtl ? 'هەولێر - کوردستان' : 'Erbil - Kurdistan',
      },
      product:
        category === 'cars' && carPriceIqd
          ? {
              id: `car-${Date.now()}`,
              name: `${carMake} ${carModel} ${carYear}`,
              price: Number(carPriceIqd),
              image: coverImage,
              in_stock: true,
            }
          : productName.trim() && productPrice
          ? {
              id: `prod-${Date.now()}`,
              name: productName.trim(),
              price: Number(productPrice) || 10000,
              image: coverImage,
              in_stock: true,
            }
          : undefined,
      deal: discountLabel.trim()
        ? {
            discount_label: discountLabel.trim(),
          }
        : undefined,
      fashion_details,
      car_details,
      tech_details,
      food_details,
    });

    if (category === 'cars') {
      const price = getCarAdPrice(carAdDuration);
      toast.success(
        isRtl 
          ? `پۆستەکەت چاوەڕێی پشکنینە! دوای پشکنینی وەسلی پارەدان (${price.toLocaleString()} IQD) لەلایەن سوپەر ئەدمینەوە بڵاودەکرێتەوە.`
          : `Post pending approval! It will be published once Super Admin verifies the ${price.toLocaleString()} IQD payment receipt.`
      );
    } else {
      toast.success(isRtl ? 'پۆستەکەت بە سەرکەوتوویی بڵاوکرایەوە' : 'Post published successfully');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isRtl ? 'بڵاوکردنەوەی پۆست لە شاخ ستۆر' : 'Create Post in SHAKH Store'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  شاخ ستۆر
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isRtl ? 'پۆستکردن بەپێی دەسەڵاتی ڕۆڵ و زانیاری تایبەت بە هەر بەشێک' : 'Dynamic category-specific fields & role authority'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ROLE AUTHORITY STATUS BAR & SWITCHER */}
        <div className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-b border-amber-200/70 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {isSuperAdmin ? (
              <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
            )}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isRtl ? 'ڕۆڵی تۆ:' : 'Your Role:'}
            </span>
            <span className="font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/50 px-2 py-0.5 rounded-lg border border-amber-300/60 dark:border-amber-700/60 text-[11px]">
              {isSuperAdmin
                ? isRtl ? '👑 پلاتفۆرمی شاخ ستۆر (دەسەڵاتی بڵاوکردنەوە لە هەموو بەشەکان)' : '👑 SHAKH Store Platform (Full Access All Categories)'
                : ALL_SYSTEM_ROLES.find((r) => r.role === activeRole)?.[isRtl ? 'labelKu' : 'labelEn'] || activeRole}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowRoleTester(!showRoleTester)}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>{isRtl ? 'گۆڕینی ڕۆڵ بۆ تاقیکردنەوەی دەسەڵاتەکان' : 'Switch Role (Test Permissions)'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRoleTester ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Interactive Role Switcher Drawer (To easily test roles and permissions) */}
        {showRoleTester && (
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isRtl ? 'ڕۆڵێک هەڵبژێرە بۆ تاقیکردنەوەی دەسەڵاتی پۆستکردن:' : 'Select a role to test posting authority:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ALL_SYSTEM_ROLES.map((r) => {
                const isCurrent = (r.role === 'SUPER_ADMIN' && isSuperAdmin) || activeRole === r.role;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setActiveRole(r.role);
                      const newAllowed = getRoleAllowedCategories(r.role);
                      if (!newAllowed.includes(category)) {
                        setCategory(newAllowed[0] as any);
                      }
                    }}
                    className={`p-2 rounded-xl text-start text-[11px] font-bold border transition-all truncate ${
                      isCurrent
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {isRtl ? r.labelKu : r.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* CATEGORY SELECTOR (Filtered / Locked according to Role Authority) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>{isRtl ? 'بەشی پۆست (هەڵبژاردنی پۆلێن)' : 'Select Category'}</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {isSuperAdmin
                  ? isRtl ? 'پلاتفۆرمی شاخ مۆڵەتی تەواوی هەیە' : 'SHAKH Platform has full permission'
                  : isRtl ? 'بەپێی دەسەڵاتی ڕۆڵەکەت' : 'Scoped to your role'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'fashion', label: isRtl ? '👗 جل و بەرگ (Fashion)' : 'Fashion & Clothes', icon: Shirt, desc: isRtl ? 'پیاوان، ئافرەتان، ڕەنگ و قەبارە' : 'Men, Women, Colors, Sizes' },
                { id: 'cars', label: isRtl ? '🚗 ئۆتۆمبێل (IQ Cars)' : 'Cars (IQ Cars)', icon: Car, desc: isRtl ? 'براند، مۆدێل، کیلۆمەتر، تابلۆ' : 'Make, Model, KM, Specs' },
                { id: 'food', label: isRtl ? '🍔 خواردن و فاست فوود' : 'Food & Restaurant', icon: Utensils, desc: isRtl ? 'ژەمەکان، کاتی ئامادەکردن' : 'Meals, Prep Time' },
                { id: 'tech', label: isRtl ? '📱 تەکنەلۆژیا و مۆبایل' : 'Tech & Mobiles', icon: Smartphone, desc: isRtl ? 'ڕام، بیرگە، زەمان' : 'RAM, Storage, Brand' },
                { id: 'offers', label: isRtl ? '🔥 داشکاندن و ئۆفەر' : 'Special Deals', icon: Tag, desc: isRtl ? 'داشکاندنی ڕاستەوخۆ' : 'Direct Discounts' },
                { id: 'market', label: isRtl ? '🛒 مارکێت و خۆراک' : 'Supermarket', icon: ShoppingBag, desc: isRtl ? 'سەوزە و میوە و پێداویستی' : 'Groceries & Fruits' },
              ].map((c) => {
                const IconComponent = c.icon;
                const isAllowed = isSuperAdmin || allowedCategories.includes(c.id);
                const isSelected = category === c.id;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (isAllowed) {
                        setCategory(c.id as any);
                      } else {
                        alert(
                          isRtl
                            ? `تەنها پلاتفۆرمی شاخ ستۆر یان فرۆشگای تایبەت بە ${c.label} دەسەڵاتی پۆستکردنی هەیە.`
                            : `Only SHAKH Platform or merchants authorized for ${c.label} can post here.`
                        );
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all text-start relative group flex flex-col justify-between min-h-[76px] ${
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-2 ring-primary-300 dark:ring-primary-900'
                        : isAllowed
                        ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                        : 'bg-slate-100/70 dark:bg-slate-850/40 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-800/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`} />
                      {!isAllowed && (
                        <span title="Locked - Outside role authority" className="text-amber-500">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs block leading-tight mt-1 truncate">
                        {c.label}
                      </span>
                      <span className={`text-[10px] block truncate ${isSelected ? 'text-primary-100' : 'text-slate-400'}`}>
                        {c.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC FIELD SECTION: FASHION (جل و بەرگ) */}
          {category === 'fashion' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/70 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20 border-2 border-pink-200 dark:border-pink-900/50 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-pink-700 dark:text-pink-300 font-extrabold text-xs uppercase tracking-wider">
                <Shirt className="w-4 h-4" />
                <span>{isRtl ? 'زانیاریەکانی جل و بەرگ (پیاوان، ئافرەتان، منداڵان، ڕەنگ و قەبارە)' : 'Clothing Specs (Gender, Colors, Sizes)'}</span>
              </div>

              {/* Target Audience: Men / Women / Kids / Unisex */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'بۆ کێ گونجاوە؟ (Target Audience)' : 'Gender / Audience'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'men', label: isRtl ? '👔 پیاوان' : 'Men' },
                    { id: 'women', label: isRtl ? '👗 ئافرەتان' : 'Women' },
                    { id: 'kids', label: isRtl ? '🧸 منداڵان' : 'Kids' },
                    { id: 'unisex', label: isRtl ? '✨ هەردووکیان' : 'Unisex' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFashionGender(g.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        fashionGender === g.id
                          ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-pink-200 dark:border-slate-700 hover:border-pink-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes (قەبارەکان) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{isRtl ? 'قەبارە بەردەستەکان (قەبارەکان دیاری بکە)' : 'Available Sizes'}</span>
                  <span className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                    {selectedSizes.length} {isRtl ? 'قەبارە دیاریکراوە' : 'selected'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FASHION_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-pink-400'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors (ڕەنگەکان) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'ڕەنگە بەردەستەکان' : 'Available Colors'}</span>
                  </span>
                  <span className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                    {selectedColors.join('، ')}
                  </span>
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {FASHION_COLORS.map((color) => {
                    const isSelected = selectedColors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color.name)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-900 dark:text-pink-200 border-pink-500 font-extrabold shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-pink-300'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ${color.border ? 'border border-slate-300' : ''}`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="truncate">{color.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-pink-600 ms-auto" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Color */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder={isRtl ? 'ڕەنگێکی تر زیاد بکە (نموونە: زەیتوونی)...' : 'Add custom color...'}
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="input-field text-xs py-1.5 px-3 rounded-xl flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-colors"
                  >
                    {isRtl ? 'زیادکردن' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Fabric & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isRtl ? 'جۆری قوماش (Fabric)' : 'Fabric / Material'}
                  </label>
                  <select
                    value={fashionFabric}
                    onChange={(e) => setFashionFabric(e.target.value)}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full"
                  >
                    <option value="لۆکەی ١٠٠٪ (Cotton)">لۆکەی ١٠٠٪ (Cotton)</option>
                    <option value="کەتان (Linen)">کەتان (Linen)</option>
                    <option value="جێنز (Denim)">جێنز (Denim)</option>
                    <option value="پەشم و مووری (Wool)">پەشم و مووری (Wool)</option>
                    <option value="ئاوریشم (Silk)">ئاوریشم (Silk)</option>
                    <option value="سترێچ و سپۆرت (Stretch)">سترێچ و سپۆرت (Stretch)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isRtl ? 'باری جلوبەرگ' : 'Condition'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFashionCondition('new')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        fashionCondition === 'new'
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isRtl ? 'نوێ بە لەزگە' : 'Brand New'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFashionCondition('used')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        fashionCondition === 'used'
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isRtl ? 'وەک نوێ' : 'Like New'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELD SECTION: CARS (ئۆتۆمبێل - IQ Cars style) */}
          {category === 'cars' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-900/50 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-extrabold text-xs uppercase tracking-wider">
                  <Car className="w-4 h-4" />
                  <span>{isRtl ? 'زانیاریەکانی ئۆتۆمبێل (IQ Cars Form)' : 'Vehicle Specs (IQ Cars Format)'}</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                  IQ Cars Standard
                </span>
              </div>

              {/* Make & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isRtl ? 'براندی ئۆتۆمبێل (Make)' : 'Car Make / Brand'}
                  </label>
                  <select
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full font-bold"
                  >
                    {POPULAR_CAR_MAKES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isRtl ? 'مۆدێل و ناوی سەیارە (Model)' : 'Model Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? 'نموونە: Land Cruiser، Camry، Tucson' : 'e.g. Camry, Land Cruiser'}
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full font-bold"
                  />
                </div>
              </div>

              {/* Year & Mileage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'ساڵی دروستکردن' : 'Year'}</span>
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max="2026"
                    value={carYear}
                    onChange={(e) => setCarYear(Number(e.target.value))}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'کیلۆمەتری ڕۆیشتوو (کم)' : 'Mileage (km)'}</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={carMileage}
                    onChange={(e) => setCarMileage(Number(e.target.value))}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isRtl ? 'ڕەنگی دەرەوە' : 'Exterior Color'}
                  </label>
                  <input
                    type="text"
                    placeholder={isRtl ? 'سپی سەدەفی، ڕەش...' : 'Pearl White, Black...'}
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full"
                  />
                </div>
              </div>

              {/* Transmission & Fuel & Cylinders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isRtl ? 'گێڕ (Transmission)' : 'Gearbox'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCarGear('automatic')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        carGear === 'automatic'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isRtl ? 'ئۆتۆماتیک' : 'Auto'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCarGear('manual')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        carGear === 'manual'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isRtl ? 'عادی' : 'Manual'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'سووتەمەنی' : 'Fuel Type'}</span>
                  </label>
                  <select
                    value={carFuel}
                    onChange={(e) => setCarFuel(e.target.value as any)}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full"
                  >
                    <option value="petrol">{isRtl ? 'بەنزین (Petrol)' : 'Petrol'}</option>
                    <option value="hybrid">{isRtl ? 'هایبرید (Hybrid)' : 'Hybrid'}</option>
                    <option value="electric">{isRtl ? 'کارەبایی (Electric)' : 'Electric'}</option>
                    <option value="diesel">{isRtl ? 'دیزڵ (Diesel)' : 'Diesel'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isRtl ? 'ژمارەی پستۆن (سلندەر)' : 'Cylinders'}
                  </label>
                  <select
                    value={carCylinders}
                    onChange={(e) => setCarCylinders(Number(e.target.value))}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full font-mono font-bold"
                  >
                    <option value={4}>4 {isRtl ? 'پستۆن (4 Cyl)' : 'Cyl'}</option>
                    <option value={6}>6 {isRtl ? 'پستۆن (V6)' : 'Cyl (V6)'}</option>
                    <option value={8}>8 {isRtl ? 'پستۆن (V8)' : 'Cyl (V8)'}</option>
                    <option value={3}>3 {isRtl ? 'پستۆن (3 Cyl)' : 'Cyl'}</option>
                  </select>
                </div>
              </div>

              {/* Plate & Condition Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تابلۆ و ڕەقەم (شار)' : 'License Plate City'}</span>
                  </label>
                  <select
                    value={carPlateCity}
                    onChange={(e) => setCarPlateCity(e.target.value)}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full font-bold"
                  >
                    {PLATE_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isRtl ? 'باری بۆیاخ و لێدراوی (Paint & Body)' : 'Body & Paint Condition'}
                  </label>
                  <select
                    value={carConditionStatus}
                    onChange={(e) => setCarConditionStatus(e.target.value)}
                    className="input-field text-xs py-2 px-3 rounded-xl w-full"
                  >
                    <option value="بێ بۆیاخ و بێ لێدراو (پاک)">بێ بۆیاخ و بێ لێدراو (Clean / No Paint)</option>
                    <option value="تەنها یەک پارچە بۆیاخ">تەنها یەک پارچە بۆیاخ</option>
                    <option value="دوو پارچە بۆیاخ">دوو پارچە بۆیاخ</option>
                    <option value="تەعدیل سارد و لەزگەی شەریکە">تەعدیل سارد و لەزگەی شەریکە</option>
                    <option value="تەنها دەعامەیی پێشەوە بۆیاخ">تەنها دەعامەیی بۆیاخ</option>
                  </select>
                </div>
              </div>

              {/* Price in IQD */}
              <div className="space-y-1.5 p-3 rounded-xl bg-blue-100/60 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60">
                <label className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'نرخ بە دیناری عێراقی (IQD)' : 'Price in IQD'}</span>
                  </span>
                  {carPriceIqd && Number(carPriceIqd) > 0 && (
                    <span className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                      {Number(carPriceIqd).toLocaleString()} IQD
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  placeholder="30000000"
                  value={carPriceIqd}
                  onChange={(e) => setCarPriceIqd(e.target.value)}
                  className="input-field text-xs py-2 px-3 rounded-xl w-full font-mono font-bold text-base"
                />
              </div>
            </div>
          )}

          {/* DYNAMIC FIELD SECTION: TECH (تەکنەلۆژیا) */}
          {category === 'tech' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/70 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 border-2 border-violet-200 dark:border-violet-900/50 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-extrabold text-xs uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>{isRtl ? 'زانیاریەکانی مۆبایل و تەکنەلۆژیا' : 'Tech & Mobile Specs'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Brand (Apple, Samsung...)"
                  value={techBrand}
                  onChange={(e) => setTechBrand(e.target.value)}
                  className="input-field text-xs py-2 px-3 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Model (iPhone 16 Pro, S25...)"
                  value={techModel}
                  onChange={(e) => setTechModel(e.target.value)}
                  className="input-field text-xs py-2 px-3 rounded-xl"
                />
                <select
                  value={techStorage}
                  onChange={(e) => setTechStorage(e.target.value)}
                  className="input-field text-xs py-2 px-3 rounded-xl"
                >
                  <option value="128GB">128GB Storage</option>
                  <option value="256GB">256GB Storage</option>
                  <option value="512GB">512GB Storage</option>
                  <option value="1TB">1TB Storage</option>
                </select>
                <select
                  value={techRam}
                  onChange={(e) => setTechRam(e.target.value)}
                  className="input-field text-xs py-2 px-3 rounded-xl"
                >
                  <option value="6GB">6GB RAM</option>
                  <option value="8GB">8GB RAM</option>
                  <option value="12GB">12GB RAM</option>
                  <option value="16GB">16GB RAM</option>
                </select>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELD SECTION: FOOD (خواردن) */}
          {category === 'food' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 border-2 border-amber-200 dark:border-amber-900/50 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                <Utensils className="w-4 h-4" />
                <span>{isRtl ? 'زانیاریەکانی خواردن و چێشتخانە' : 'Food & Restaurant Specs'}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder={isRtl ? 'جۆری ژەم (برگر، پیتزا...)' : 'Meal type...'}
                  value={foodMealType}
                  onChange={(e) => setFoodMealType(e.target.value)}
                  className="input-field text-xs py-2 px-3 rounded-xl"
                />
                <select
                  value={foodSpicyLevel}
                  onChange={(e) => setFoodSpicyLevel(e.target.value as any)}
                  className="input-field text-xs py-2 px-3 rounded-xl"
                >
                  <option value="mild">{isRtl ? 'بێ تیژی (Mild)' : 'Mild'}</option>
                  <option value="medium">{isRtl ? 'کەمێک تیژ (Medium)' : 'Medium Spicy'}</option>
                  <option value="spicy">{isRtl ? 'زۆر تیژ (Hot)' : 'Very Spicy'}</option>
                </select>
                <input
                  type="number"
                  placeholder={isRtl ? 'کاتی ئامادەکردن (خولەک)' : 'Prep time (mins)'}
                  value={foodPrepTime}
                  onChange={(e) => setFoodPrepTime(Number(e.target.value))}
                  className="input-field text-xs py-2 px-3 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {/* General Post Details: Title & Description */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isRtl ? 'سەردێڕی سەرەکی پۆست' : 'Post Title'}
              </label>
              <input
                type="text"
                placeholder={
                  category === 'cars'
                    ? isRtl ? 'نموونە: تۆیۆتا لاندکرۆزەر ٢٠٢٤ سیفر کیلۆمەتر بێ بۆیاخ لە هەولێر' : 'e.g. Toyota Land Cruiser 2024 Zero KM Clean Erbil'
                    : category === 'fashion'
                    ? isRtl ? 'نموونە: هۆدی و چاکەتی پیاوان و ئافرەتان بە کوالێتی بەرز و داشکاندنی شاز' : 'e.g. Premium Cotton Hoodie Men & Women all sizes'
                    : isRtl ? 'سەردێڕی سەرنجڕاکێش بۆ پۆستەکە بنووسە...' : 'Catchy title for your post...'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full input-field text-xs py-2.5 px-3.5 rounded-xl font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{isRtl ? 'ڕوونکردنەوە و تەواوی دەقی پۆست *' : 'Post Description *'}</span>
                <span className="text-rose-500 text-[11px]">* Required</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  category === 'cars'
                    ? isRtl ? 'هەموو زانیاری و تێبینییەکانی سەیارەکە (وەک iq cars): بار، تایە، بەستەر، مەعامەلە...' : 'Write vehicle description, warranty, details...'
                    : isRtl ? 'دەربارەی کاڵاکە، گەیاندن و تایبەتمەندییەکان بنووسە...' : 'Write full post description...'
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full input-field text-xs py-2.5 px-3.5 rounded-xl resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* IMAGE UPLOAD SECTION: GALLERY OR CAMERA (No URL link needed) */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            {/* Hidden Native File Inputs for Gallery & Camera */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary-600" />
                <span>{isRtl ? 'وێنەی پۆست (لە گەلەری یان بە کامێرا)' : 'Post Photos (Gallery or Camera)'}</span>
              </label>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                {uploadedImages.length > 0
                  ? isRtl ? `${uploadedImages.length} وێنە هەڵبژێردراوە` : `${uploadedImages.length} photos selected`
                  : isRtl ? 'ڕاستەوخۆ بەرزبکەرەوە' : 'Direct Upload'}
              </span>
            </div>

            {/* Action Buttons: Pick from Gallery vs. Take Photo with Camera */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="py-3 px-4 rounded-xl bg-white dark:bg-slate-700 border-2 border-dashed border-primary-400/80 dark:border-primary-500/80 hover:bg-primary-50 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-300 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <span className="block font-bold text-xs text-primary-700 dark:text-primary-300">
                    {isRtl ? 'لە گەلەری وێنەکان' : 'Choose from Gallery'}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    {isRtl ? 'لە مۆبایل یان کۆمپیوتەر' : 'Select from device'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-3 px-4 rounded-xl bg-white dark:bg-slate-700 border-2 border-dashed border-emerald-400/80 dark:border-emerald-500/80 hover:bg-emerald-50 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <span className="block font-bold text-xs text-emerald-700 dark:text-emerald-300">
                    {isRtl ? 'بە کامێرا وێنە بگرە' : 'Take with Camera'}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    {isRtl ? 'ڕاستەوخۆ وێنە بگرە' : 'Capture photo live'}
                  </span>
                </div>
              </button>
            </div>

            {/* Reading / Loading Feedback */}
            {isReadingImage && (
              <div className="text-center py-2 text-xs font-bold text-primary-600 animate-pulse">
                {isRtl ? 'وێنەکان ئامادە دەکرێن...' : 'Processing images...'}
              </div>
            )}

            {/* Selected Images Gallery Preview */}
            {uploadedImages.length > 0 ? (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 block">
                  {isRtl ? 'وێنە هەڵبژێردراوەکان (یەکەم وێنە وەک بەرگ دەردەکەوێت):' : 'Selected Photos (First photo is cover):'}
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {uploadedImages.map((imgSrc, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800">
                      <img src={imgSrc} alt={`Selected ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 right-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold py-0.5 px-1 rounded text-center truncate">
                          {isRtl ? 'بەرگ (Cover)' : 'Cover'}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition-transform active:scale-95"
                        title={isRtl ? 'سڕینەوەی وێنە' : 'Remove image'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Quick Add More Box */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-500 flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-bold">{isRtl ? 'زیادکردن' : 'Add'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => galleryInputRef.current?.click()}
                className="py-4 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-750 transition-colors"
              >
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {isRtl
                    ? 'دەتوانی وێنە ڕابکێشیت بۆ ئێرە یان بە کامێرا بگریت، هیچ لینک دانان پێویست نییە'
                    : 'Drag & drop photos here or use buttons above. No links required!'}
                </span>
              </div>
            )}
          </div>

          {/* Optional Tagged Product Pill & Price for general items */}
          {category !== 'cars' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-primary-600" />
                <span>{isRtl ? 'نرخ و ناوی کاڵا بۆ کڕینی ڕاستەوخۆ' : 'Tagged Item & Price for Instant Purchase'}</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder={isRtl ? 'ناوی کاڵاکە...' : 'Product name...'}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-field text-xs py-2 px-3 rounded-xl"
                />
                <input
                  type="number"
                  placeholder={isRtl ? 'نرخ بە دینار (IQD)...' : 'Price in IQD...'}
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="input-field text-xs py-2 px-3 rounded-xl font-mono"
                />
              </div>

              <input
                type="text"
                placeholder={isRtl ? 'داشکاندن (نموونە: ٢٠٪ داشکاندن)...' : 'Deal badge (e.g. 20% OFF)...'}
                value={discountLabel}
                onChange={(e) => setDiscountLabel(e.target.value)}
                className="w-full input-field text-xs py-2 px-3 rounded-xl"
              />
            </div>
          )}

          {/* Hashtags */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{isRtl ? 'هاشتاگەکان (بە کۆما جیایان بکەوە)' : 'Hashtags (comma separated)'}</span>
            </label>
            <input
              type="text"
              placeholder={category === 'cars' ? '#IQCars, #ErbilCars, #Toyota, #شاخ_ستۆر' : '#شاخ_ستۆر, #جلوبەرگ, #کوردستان'}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full input-field text-xs py-2 px-3 rounded-xl"
            />
          </div>

          {/* Cars Advertising Fee Section */}
          {category === 'cars' && (
            <div className="p-3.5 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 space-y-3">
              <span className="text-xs font-bold text-primary-800 dark:text-primary-200 flex items-center gap-1.5">
                <Car className="w-4 h-4" />
                <span>{isRtl ? 'کرێی ڕیکلامی ئۆتۆمبێل (بێ وەرگرتنی ڕێژەی فرۆشتن)' : 'Car Listing Fee (0% Sales Commission)'}</span>
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCarAdDuration('1_week')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    carAdDuration === '1_week'
                      ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-400'
                  }`}
                >
                  <div className="text-[11px] font-medium opacity-80">{isRtl ? '١ هەفتە (1 Week)' : '1 Week'}</div>
                  <div className="font-bold text-sm mt-0.5">2,750 IQD</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCarAdDuration('15_days')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    carAdDuration === '15_days'
                      ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-400'
                  }`}
                >
                  <div className="text-[11px] font-medium opacity-80">{isRtl ? '١٥ ڕۆژ (15 Days)' : '15 Days'}</div>
                  <div className="font-bold text-sm mt-0.5">3,750 IQD</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCarAdDuration('1_month')}
                  className={`p-2.5 rounded-xl border text-center transition-all relative ${
                    carAdDuration === '1_month'
                      ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-400'
                  }`}
                >
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                    {isRtl ? 'باشترین' : 'Best'}
                  </span>
                  <div className="text-[11px] font-medium opacity-80">{isRtl ? '١ مانگ (1 Month)' : '1 Month'}</div>
                  <div className="font-bold text-sm mt-0.5">5,000 IQD</div>
                </button>
              </div>
              
              <div className="text-[10px] text-primary-700 dark:text-primary-300 leading-relaxed text-center opacity-90">
                {isRtl 
                  ? 'بڕی دیاریکراو پێش بڵاوکردنەوە لە باڵانسی هەژمارەکەت دەبڕدرێت. لە کاتی فرۆشتنی ئۆتۆمبێلەکە هیچ ڕێژەیەک بۆ پلاتفۆرم نادەیت.' 
                  : 'The selected fee will be deducted from your wallet. 0% commission on the actual sale.'}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500">
              {isSuperAdmin
                ? isRtl ? 'دەسەڵاتی پلاتفۆرمی شاخ چالاکە' : 'SHAKH Platform authority active'
                : isRtl ? `بڵاوکردنەوە لە بەشی ${category}` : `Posting in ${category}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                {isRtl ? 'پاشگەزبوونەوە' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!canPostInCurrentCategory}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {category === 'cars'
                    ? isRtl ? `پارەدان (${getCarAdPrice(carAdDuration).toLocaleString()} IQD) و بڵاوکردنەوە` : `Pay (${getCarAdPrice(carAdDuration).toLocaleString()} IQD) & Publish`
                    : isRtl ? 'بڵاوکردنەوە لە شاخ ستۆر' : 'Publish to SHAKH Store'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
