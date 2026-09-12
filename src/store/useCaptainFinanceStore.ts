import { create } from 'zustand';
import { CaptainFinanceProfile, CaptainOrder, SettlementRecord } from '../types/captainFinance';

interface CaptainFinanceState {
  captains: CaptainFinanceProfile[];
  selectedCaptainId: string;
  
  // Actions
  setSelectedCaptainId: (id: string) => void;
  recordSettlement: (params: {
    captainId: string;
    amountReturned: number;
    paymentMethod: 'CASH_OFFICE' | 'FASTPAY' | 'FIB' | 'ZAIN_CASH' | 'BANK_TRANSFER';
    receivedBy: string;
    breakdown?: {
      platformFeeSettled?: number;
      orderAmountSettled?: number;
      deliverySettled?: number;
    };
    notes?: string;
  }) => SettlementRecord | null;
  addOrderToCaptain: (captainId: string, order: Omit<CaptainOrder, 'id' | 'completedAt' | 'status'>) => void;
  resetToDefault: () => void;
}

// Initial Sample Data with Captain Ahmed (5 food orders + 4 market orders)
// Includes explicit breakdown of:
// 1) orderAmount (پارەی ئۆردەر بۆ چێشتخانە و مارکێت)
// 2) deliveryFee & captainDeliveryFee (کرێی گەیاندن و پشکی کاپتن)
// 3) platformFee (پارەی پلاتفۆرمی شاخ / عمولەی شاخ)
const INITIAL_CAPTAINS: CaptainFinanceProfile[] = [
  {
    id: 'capt-ahmed',
    name: 'کاپتن ئەحمەد (Captain Ahmed)',
    phone: '0750 123 4567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    vehiclePlate: 'Erbil 18920 B',
    vehicleType: 'ماتۆڕسکیل (Motorbike)',
    activeStatus: 'ONLINE',
    orders: [
      // 5 Food Orders
      {
        id: 'ord-food-1',
        orderNumber: 'SHAKH-FD-101',
        category: 'food',
        categoryLabelKu: 'چێشتخانە (Food)',
        storeName: 'چێشتخانەی دیوان (Diwan Restaurant)',
        customerName: 'ڕێبین عەلی',
        customerPhone: '0750 444 1122',
        deliveryAddress: 'هەولێر، بەختیاری، ڤێلا 12',
        orderAmount: 32000,
        deliveryFee: 3500,
        captainDeliveryFee: 2500,
        platformFee: 1000,
        totalCashCollected: 35500,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-food-2',
        orderNumber: 'SHAKH-FD-102',
        category: 'food',
        categoryLabelKu: 'چێشتخانە (Food)',
        storeName: 'بەرگەر لاب (Burger Lab)',
        customerName: 'هۆزان کەریم',
        customerPhone: '0770 234 5678',
        deliveryAddress: 'هەولێر، وەزیران، گەڕەکی 104',
        orderAmount: 24500,
        deliveryFee: 3000,
        captainDeliveryFee: 2250,
        platformFee: 750,
        totalCashCollected: 27500,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-food-3',
        orderNumber: 'SHAKH-FD-103',
        category: 'food',
        categoryLabelKu: 'چێشتخانە (Food)',
        storeName: 'سوڵتان بەرگەر (Sultan Burger)',
        customerName: 'دابان ئازاد',
        customerPhone: '0750 998 8776',
        deliveryAddress: 'هەولێر، دریم سیتی، پڕۆژەی 4',
        orderAmount: 18000,
        deliveryFee: 3000,
        captainDeliveryFee: 2000,
        platformFee: 1000,
        totalCashCollected: 21000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-food-4',
        orderNumber: 'SHAKH-FD-104',
        category: 'food',
        categoryLabelKu: 'چێشتخانە (Food)',
        storeName: 'پیتزا هات ئیمپایەر (Pizza Hut Empire)',
        customerName: 'سارا حەسەن',
        customerPhone: '0751 222 3344',
        deliveryAddress: 'ئیمپایەر وۆڕڵد، تاوەری رۆیاڵ',
        orderAmount: 29000,
        deliveryFee: 3500,
        captainDeliveryFee: 2500,
        platformFee: 1000,
        totalCashCollected: 32500,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-food-5',
        orderNumber: 'SHAKH-FD-105',
        category: 'food',
        categoryLabelKu: 'چێشتخانە (Food)',
        storeName: 'شاوەرمای مووسڵ (Mosul Shawarma)',
        customerName: 'کاروان تەها',
        customerPhone: '0750 333 4455',
        deliveryAddress: 'ئیسکان، شەقامی سەرەکی',
        orderAmount: 14500,
        deliveryFee: 3000,
        captainDeliveryFee: 2250,
        platformFee: 750,
        totalCashCollected: 17500,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: 'DELIVERED',
      },

      // 4 Supermarket Orders
      {
        id: 'ord-mkt-1',
        orderNumber: 'SHAKH-MK-201',
        category: 'market',
        categoryLabelKu: 'مارکێت (Market)',
        storeName: 'کارفوور مارکێت (Carrefour Market)',
        customerName: 'شەیدا مەحموود',
        customerPhone: '0750 678 9012',
        deliveryAddress: 'گەڕەکی ئاشتی، کۆڵانی 12',
        orderAmount: 46000,
        deliveryFee: 3000,
        captainDeliveryFee: 2000,
        platformFee: 1000,
        totalCashCollected: 49000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-mkt-2',
        orderNumber: 'SHAKH-MK-202',
        category: 'market',
        categoryLabelKu: 'مارکێت (Market)',
        storeName: 'سوپەرمارکێتی فامیلی مۆڵ (Family Mall Supermarket)',
        customerName: 'فەرهاد جەمیل',
        customerPhone: '0770 111 2233',
        deliveryAddress: '100 مەتری، نەخۆشخانەی پار بەرامبەر',
        orderAmount: 38500,
        deliveryFee: 3500,
        captainDeliveryFee: 2500,
        platformFee: 1000,
        totalCashCollected: 42000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-mkt-3',
        orderNumber: 'SHAKH-MK-203',
        category: 'market',
        categoryLabelKu: 'مارکێت (Market)',
        storeName: 'مارکێتی شاری نوێ (New City Market)',
        customerName: 'بەناز کەمال',
        customerPhone: '0750 888 7766',
        deliveryAddress: 'شاری گوندە کوردیەکە',
        orderAmount: 22000,
        deliveryFee: 3000,
        captainDeliveryFee: 2250,
        platformFee: 750,
        totalCashCollected: 25000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-mkt-4',
        orderNumber: 'SHAKH-MK-204',
        category: 'market',
        categoryLabelKu: 'مارکێت (Market)',
        storeName: 'میوە و سەوزەی کوردستان (Kurdistan Fresh)',
        customerName: 'ئاراس پێشڕەو',
        customerPhone: '0750 555 4433',
        deliveryAddress: 'عەنکاوە، شەقامی مار یوسف',
        orderAmount: 19000,
        deliveryFee: 3000,
        captainDeliveryFee: 2250,
        platformFee: 750,
        totalCashCollected: 22000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'DELIVERED',
      },
    ],
    settlements: [
      {
        id: 'stl-init-1',
        captainId: 'capt-ahmed',
        captainName: 'کاپتن ئەحمەد (Captain Ahmed)',
        amountReturned: 50000,
        previousBalance: 325500,
        newBalance: 275500,
        breakdown: {
          platformFeeSettled: 5000,
          orderAmountSettled: 45000,
        },
        paymentMethod: 'CASH_OFFICE',
        paymentMethodLabelKu: 'کاش لە ئۆفیسی کۆمپانیا',
        receivedBy: 'سەرپەرشتیاری دارایی (سەردار خانۆ)',
        referenceCode: 'RC-89201',
        notes: 'گەڕاندنەوەی سەرەتایی پێشینەی نیوەڕۆ (هێنراوەتە خوارەوە)',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
    ],
  },
  {
    id: 'capt-rebin',
    name: 'کاپتن ڕێبین (Captain Rebin)',
    phone: '0750 789 0123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    vehiclePlate: 'Erbil 44102 A',
    vehicleType: 'ماتۆڕسکیل (Motorbike)',
    activeStatus: 'ONLINE',
    orders: [
      {
        id: 'ord-reb-1',
        orderNumber: 'SHAKH-FD-301',
        category: 'food',
        categoryLabelKu: 'چێشتخانە (Food)',
        storeName: 'تۆشکا بەرگەر',
        customerName: 'کامەران ڕەحیم',
        deliveryAddress: 'بەختیاری',
        orderAmount: 25000,
        deliveryFee: 3000,
        captainDeliveryFee: 2250,
        platformFee: 750,
        totalCashCollected: 28000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-reb-2',
        orderNumber: 'SHAKH-MK-302',
        category: 'market',
        categoryLabelKu: 'مارکێت (Market)',
        storeName: 'ماجدی مۆڵ سوپەرمارکێت',
        customerName: 'لاوین عومەر',
        deliveryAddress: 'ڕۆژسیتی',
        orderAmount: 34000,
        deliveryFee: 3000,
        captainDeliveryFee: 2000,
        platformFee: 1000,
        totalCashCollected: 37000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        status: 'DELIVERED',
      },
    ],
    settlements: [],
  },
  {
    id: 'capt-karwan',
    name: 'کاپتن کاروان (Captain Karwan)',
    phone: '0750 456 7890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    vehiclePlate: 'Erbil 90214 H',
    vehicleType: 'ئۆتۆمبێل (Car)',
    activeStatus: 'ONLINE',
    orders: [
      {
        id: 'ord-kar-1',
        orderNumber: 'SHAKH-FD-401',
        category: 'food',
        categoryLabelKu: 'چێشتخانە (Food)',
        storeName: 'چێشتخانەی دیوان',
        customerName: 'پشتیوان مەحموود',
        deliveryAddress: 'شەقامی 40 مەتری',
        orderAmount: 48000,
        deliveryFee: 4000,
        captainDeliveryFee: 3000,
        platformFee: 1000,
        totalCashCollected: 52000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
        status: 'DELIVERED',
      },
      {
        id: 'ord-kar-2',
        orderNumber: 'SHAKH-MK-402',
        category: 'market',
        categoryLabelKu: 'مارکێت (Market)',
        storeName: 'کارفوور مارکێت',
        customerName: 'سۆران جەبار',
        deliveryAddress: 'گوندی لوبنانی',
        orderAmount: 55000,
        deliveryFee: 4000,
        captainDeliveryFee: 3000,
        platformFee: 1000,
        totalCashCollected: 59000,
        paymentMethod: 'CASH_ON_DELIVERY',
        completedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        status: 'DELIVERED',
      },
    ],
    settlements: [],
  },
];

const STORAGE_KEY = 'shakh_captain_finances_v2';

const sanitizeCaptainData = (profiles: CaptainFinanceProfile[]): CaptainFinanceProfile[] => {
  return profiles.map((cap) => ({
    ...cap,
    orders: (cap.orders || []).map((ord) => {
      const orderAmount = Number(ord.orderAmount) || 0;
      const deliveryFee = Number(ord.deliveryFee) || 3000;
      const platformFee = Number(ord.platformFee) ?? 1000;
      const captainDeliveryFee = Number(ord.captainDeliveryFee) ?? Math.max(0, deliveryFee - platformFee);
      const totalCashCollected = Number(ord.totalCashCollected) || (orderAmount + deliveryFee);
      return {
        ...ord,
        orderAmount,
        deliveryFee,
        platformFee,
        captainDeliveryFee,
        totalCashCollected,
      };
    }),
    settlements: cap.settlements || [],
  }));
};

const loadSavedCaptains = (): CaptainFinanceProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeCaptainData(parsed);
      }
    }
  } catch {
    // fallback
  }
  return sanitizeCaptainData(INITIAL_CAPTAINS);
};

export const useCaptainFinanceStore = create<CaptainFinanceState>((set, get) => ({
  captains: loadSavedCaptains(),
  selectedCaptainId: 'capt-ahmed', // Default to Captain Ahmed

  setSelectedCaptainId: (id: string) => set({ selectedCaptainId: id }),

  recordSettlement: ({ captainId, amountReturned, paymentMethod, receivedBy, breakdown, notes }) => {
    const { captains } = get();
    const captain = captains.find((c) => c.id === captainId);
    if (!captain) return null;

    // Calculate current collected cash and already settled
    const totalCollected = captain.orders.reduce((sum, o) => sum + o.totalCashCollected, 0);
    const totalAlreadyReturned = captain.settlements.reduce((sum, s) => sum + s.amountReturned, 0);
    const currentBalance = Math.max(0, totalCollected - totalAlreadyReturned);
    const newBalance = Math.max(0, currentBalance - amountReturned); // هێنراوەتە خوارەوە

    const methodLabels: Record<string, string> = {
      CASH_OFFICE: 'کاش لە ئۆفیسی شاخ ستۆر',
      FASTPAY: 'فاستپەی (FastPay)',
      FIB: 'بانکی یەکەمی عێراق (FIB)',
      ZAIN_CASH: 'زین کاش (ZainCash)',
      BANK_TRANSFER: 'حەواڵەی بانکی',
    };

    const newSettlement: SettlementRecord = {
      id: `stl-${Date.now()}`,
      captainId,
      captainName: captain.name,
      amountReturned,
      previousBalance: currentBalance,
      newBalance,
      breakdown,
      paymentMethod,
      paymentMethodLabelKu: methodLabels[paymentMethod] || paymentMethod,
      receivedBy: receivedBy || 'بەڕێوەبەری ئۆپەراسیۆن و دارایی',
      referenceCode: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: notes || 'گەڕاندنەوەی پارە و هێنانە خوارەوەی باڵانسی کاپتن',
      createdAt: new Date().toISOString(),
    };

    const updatedCaptains = captains.map((c) => {
      if (c.id === captainId) {
        return {
          ...c,
          settlements: [newSettlement, ...c.settlements],
        };
      }
      return c;
    });

    set({ captains: updatedCaptains });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCaptains));
    } catch {
      // ignore
    }

    return newSettlement;
  },

  addOrderToCaptain: (captainId, orderData) => {
    const { captains } = get();
    const deliveryFee = orderData.deliveryFee || 3000;
    const platformFee = orderData.platformFee ?? 1000;
    const captainDeliveryFee = orderData.captainDeliveryFee ?? Math.max(0, deliveryFee - platformFee);
    const totalCashCollected = orderData.totalCashCollected || (orderData.orderAmount + deliveryFee);

    const newOrder: CaptainOrder = {
      ...orderData,
      deliveryFee,
      platformFee,
      captainDeliveryFee,
      totalCashCollected,
      id: `ord-${Date.now()}`,
      completedAt: new Date().toISOString(),
      status: 'DELIVERED',
    };

    const updatedCaptains = captains.map((c) => {
      if (c.id === captainId) {
        return {
          ...c,
          orders: [newOrder, ...c.orders],
        };
      }
      return c;
    });

    set({ captains: updatedCaptains });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCaptains));
    } catch {
      // ignore
    }
  },

  resetToDefault: () => {
    set({ captains: sanitizeCaptainData(INITIAL_CAPTAINS), selectedCaptainId: 'capt-ahmed' });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CAPTAINS));
    } catch {
      // ignore
    }
  },
}));

// Helper selector calculations for a given captain
// Calculating all 3 components explicitly:
// 1. Order amount (پارەی ئۆردەر / کاڵاکان بۆ فرۆشیار و مارکێت و چێشتخانە)
// 2. Delivery fees (کرێی گەیاندن - پشکی کاپتن)
// 3. SHAKH Platform Fee (پارەی پلاتفۆرمی شاخ / عمولەی پلاتفۆرم)
// 4. Remaining balance to be brought down upon collection (دەهێنرێتە خوارەوە)
export const getCaptainFinancialSummary = (captain: CaptainFinanceProfile) => {
  const foodOrders = captain.orders.filter((o) => o.category === 'food');
  const marketOrders = captain.orders.filter((o) => o.category === 'market');
  const otherOrders = captain.orders.filter((o) => o.category !== 'food' && o.category !== 'market');

  // Food metrics
  const foodOrdersCount = foodOrders.length;
  const foodSubtotal = foodOrders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
  const foodDeliveryFees = foodOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const foodCaptainDeliveryFees = foodOrders.reduce((sum, o) => sum + (o.captainDeliveryFee ?? (o.deliveryFee - (o.platformFee || 1000))), 0);
  const foodPlatformFees = foodOrders.reduce((sum, o) => sum + (o.platformFee ?? 1000), 0);
  const foodCashCollected = foodOrders.reduce((sum, o) => sum + (o.totalCashCollected || 0), 0);

  // Market metrics
  const marketOrdersCount = marketOrders.length;
  const marketSubtotal = marketOrders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
  const marketDeliveryFees = marketOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const marketCaptainDeliveryFees = marketOrders.reduce((sum, o) => sum + (o.captainDeliveryFee ?? (o.deliveryFee - (o.platformFee || 1000))), 0);
  const marketPlatformFees = marketOrders.reduce((sum, o) => sum + (o.platformFee ?? 1000), 0);
  const marketCashCollected = marketOrders.reduce((sum, o) => sum + (o.totalCashCollected || 0), 0);

  // Other metrics
  const otherOrdersCount = otherOrders.length;
  const otherCashCollected = otherOrders.reduce((sum, o) => sum + (o.totalCashCollected || 0), 0);

  // Totals across all orders:
  const totalOrdersCount = captain.orders.length;
  
  // 1. کۆی پارەی ئۆردەر (Item/Merchandise cost for stores/restaurants)
  const totalItemAmount = captain.orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);

  // 2. کۆی کرێی گەیاندن (Total Delivery Fees & Captain Net Share)
  const totalDeliveryFees = captain.orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const totalCaptainDeliveryEarnings = captain.orders.reduce(
    (sum, o) => sum + (o.captainDeliveryFee ?? Math.max(0, (o.deliveryFee || 0) - (o.platformFee || 1000))),
    0
  );

  // 3. کۆی پارەی پلاتفۆرمی شاخ (SHAKH Platform Fees / Commission)
  const totalPlatformFee = captain.orders.reduce((sum, o) => sum + (o.platformFee ?? 1000), 0);

  // 4. کۆی کاشی وەرگیراو لای کاپتن (Total cash customer paid)
  const totalCashCollected = captain.orders.reduce((sum, o) => sum + (o.totalCashCollected || 0), 0);

  // 5. شایستەی کۆمپانیا و فرۆشیاران (پارەی ئۆردەر + پارەی پلاتفۆرمی شاخ)
  const totalCompanyAndVendorDue = totalItemAmount + totalPlatformFee;

  // 6. کۆی پارەی وەرگیراوە/گەڕێنراوە لە کاپتن (سێتڵمێنت)
  const totalReturnedCash = captain.settlements.reduce((sum, s) => sum + s.amountReturned, 0);

  // 7. کاشی ماوە لە لای کاپتن (دەهێنرێتە خوارەوە لە کاتی وەرگرتنەوە)
  const remainingCashInHand = Math.max(0, totalCashCollected - totalReturnedCash);

  // 8. پارەی ماوەی شایستەی کۆمپانیا/پلاتفۆرم و فرۆشیاران
  const remainingCompanyDue = Math.max(0, totalCompanyAndVendorDue - totalReturnedCash);

  const isFullySettled = remainingCashInHand === 0;

  return {
    foodOrdersCount,
    foodSubtotal,
    foodDeliveryFees,
    foodCaptainDeliveryFees,
    foodPlatformFees,
    foodCashCollected,

    marketOrdersCount,
    marketSubtotal,
    marketDeliveryFees,
    marketCaptainDeliveryFees,
    marketPlatformFees,
    marketCashCollected,

    otherOrdersCount,
    otherCashCollected,

    totalOrdersCount,
    totalItemAmount,               // 1. پارەی ئۆردەر (چێشتخانە و مارکێت)
    totalDeliveryFees,             // 2. کۆی کرێی گەیاندن
    totalCaptainDeliveryEarnings,  // 2. کرێی دەستی کاپتن لە گەیاندن
    totalPlatformFee,              // 3. پارەی پلاتفۆرمی شاخ (عمولە)
    totalCashCollected,            // 4. کۆی کاشی دەستی کاپتن
    totalCompanyAndVendorDue,      // 5. پارەی ئۆردەر + پارەی پلاتفۆرمی شاخ
    totalReturnedCash,             // 6. بڕی وەرگیراوە لە کاپتن
    remainingCashInHand,           // 7. پارەی ماوە (دەهێنرێتە خوارەوە)
    remainingCompanyDue,
    isFullySettled,
  };
};
