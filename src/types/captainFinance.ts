export type StoreCategory = 'food' | 'market' | 'fashion' | 'tech' | 'other';

export interface CaptainOrder {
  id: string;
  orderNumber: string;
  category: StoreCategory;
  categoryLabelKu: string;
  storeName: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;

  // 1. پارەی ئۆردەر (Item price for restaurant/supermarket)
  orderAmount: number;

  // 2. کرێی گەیاندن (Delivery fee)
  deliveryFee: number; // Total delivery charged
  captainDeliveryFee: number; // Captain's net delivery earnings (کرێی دەستی کاپتن)

  // 3. پارەی پلاتفۆرمی شاخ (SHAKH platform fee / commission)
  platformFee: number;

  // Total cash collected from customer = orderAmount + deliveryFee
  totalCashCollected: number;
  paymentMethod: 'CASH_ON_DELIVERY' | 'FIB' | 'FASTPAY' | 'ZAIN_CASH';
  completedAt: string;
  status: 'DELIVERED';
}

export interface SettlementRecord {
  id: string;
  captainId: string;
  captainName: string;
  amountReturned: number; // IQD returned
  previousBalance: number;
  newBalance: number; // The balance brought down (هێنراوەتە خوارەوە)
  breakdown?: {
    platformFeeSettled?: number; // پارەی پلاتفۆرمی شاخ
    orderAmountSettled?: number; // پارەی ئۆردەری فرۆشیاران
    deliverySettled?: number;
  };
  paymentMethod: 'CASH_OFFICE' | 'FASTPAY' | 'FIB' | 'ZAIN_CASH' | 'BANK_TRANSFER';
  paymentMethodLabelKu: string;
  receivedBy: string; // Admin/Accountant name
  referenceCode: string;
  notes?: string;
  createdAt: string;
}

export interface CaptainFinanceProfile {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehiclePlate: string;
  vehicleType: string;
  activeStatus: 'ONLINE' | 'BUSY' | 'OFFLINE';
  orders: CaptainOrder[];
  settlements: SettlementRecord[];
}
