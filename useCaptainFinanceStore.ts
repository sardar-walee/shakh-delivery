import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CaptainFinanceProfile, CaptainOrder, SettlementRecord } from '../types/captainFinance';

interface CaptainFinanceState {
  captains: CaptainFinanceProfile[];
  selectedCaptainId: string | null;
  loading: boolean;
  setSelectedCaptainId: (id: string) => void;
  loadCaptains: () => Promise<void>;
  recordSettlement: (params: {
    captainId: string; amountReturned: number;
    paymentMethod: 'CASH_OFFICE';
    receivedBy?: string;
    breakdown?: { platformFeeSettled?: number; orderAmountSettled?: number; deliverySettled?: number };
    notes?: string;
  }) => Promise<SettlementRecord | null>;
  addOrderToCaptain: (captainId: string, order: Omit<CaptainOrder,'id'|'completedAt'|'status'>) => Promise<void>;
  resetToDefault: () => void;
}

const mapOrder = (o: any): CaptainOrder => ({
  id: o.id, orderNumber: o.order_number,
  category: (o.category || 'other') as any,
  categoryLabelKu: o.category === 'food' ? 'چێشتخانە' : o.category === 'market' ? 'مارکێت' : 'ئۆردەر',
  storeName: o.business?.name || '',
  customerName: o.customer?.full_name || '',
  customerPhone: o.customer?.phone || undefined,
  deliveryAddress: typeof o.address === 'string' ? o.address : (o.address?.street || o.address?.district || ''),
  orderAmount: Number(o.subtotal || 0),
  deliveryFee: Number(o.delivery_fee || 0),
  captainDeliveryFee: Math.max(0, Number(o.delivery_fee || 0) - Number(o.platform_fee || 0)),
  platformFee: Number(o.platform_fee || 0),
  totalCashCollected: Number(o.total || 0),
  paymentMethod: (o.payment_method || 'CASH_ON_DELIVERY') as any,
  completedAt: o.updated_at || o.created_at,
  status: 'DELIVERED',
});

const mapSettlement = (s: any, captainName: string): SettlementRecord => ({
  id: s.id, captainId: s.captain_id, captainName,
  amountReturned: Number(s.amount_returned || 0),
  previousBalance: Number(s.previous_balance || 0),
  newBalance: Number(s.new_balance || 0),
  breakdown: s.breakdown || {},
  paymentMethod: s.payment_method,
  paymentMethodLabelKu: s.payment_method,
  receivedBy: s.received_by || '',
  referenceCode: s.reference_code,
  notes: s.notes || undefined,
  createdAt: s.created_at,
});

export const useCaptainFinanceStore = create<CaptainFinanceState>((set, get) => ({
  captains: [], selectedCaptainId: null, loading: false,

  setSelectedCaptainId: (id) => set({ selectedCaptainId: id }),

  loadCaptains: async () => {
    set({ loading: true });
    const { data: roleRows } = await supabase.from('user_roles').select('user_id').eq('role','CAPTAIN').eq('status','approved');
    const ids = (roleRows || []).map((r: any) => r.user_id);
    if (!ids.length) { set({ captains: [], selectedCaptainId: null, loading: false }); return; }

    const [{ data: profiles }, { data: orders }, { data: settlements }] = await Promise.all([
      supabase.from('profiles').select('*').in('id', ids),
      supabase.from('orders').select('*, business:businesses!orders_business_id_fkey(*), customer:profiles!orders_customer_id_fkey(*)')
        .in('captain_id', ids).eq('status','DELIVERED').order('updated_at',{ascending:false}),
      supabase.from('captain_settlements').select('*').in('captain_id', ids).order('created_at',{ascending:false}),
    ]);

    const captains = (profiles || []).map((p: any) => {
      const captainOrders = (orders || []).filter((o: any) => o.captain_id === p.id).map(mapOrder);
      const captainSettlements = (settlements || []).filter((s: any) => s.captain_id === p.id)
        .map((s: any) => mapSettlement(s, p.full_name));
      return {
        id: p.id, name: p.full_name, phone: p.phone || '', avatar: p.avatar || '',
        vehiclePlate: '', vehicleType: 'motorcycle', activeStatus: 'OFFLINE',
        orders: captainOrders, settlements: captainSettlements,
      } as CaptainFinanceProfile;
    });
    set({ captains, selectedCaptainId: get().selectedCaptainId || captains[0]?.id || null, loading: false });
  },

  recordSettlement: async ({ captainId, amountReturned, paymentMethod, receivedBy, breakdown, notes }) => {
    const captain = get().captains.find(c => c.id === captainId);
    if (!captain || amountReturned <= 0) return null;
    const summary = getCaptainFinancialSummary(captain);
    const previousBalance = summary.remainingCashInHand;
    const newBalance = Math.max(0, previousBalance - amountReturned);
    const { data, error } = await supabase.from('captain_settlements').insert({
      captain_id: captainId, amount_returned: amountReturned, previous_balance: previousBalance,
      new_balance: newBalance, payment_method: paymentMethod, breakdown: breakdown || {},
      received_by: (await supabase.auth.getUser()).data.user?.id || null, notes: notes || null,
    }).select().single();
    if (error || !data) return null;
    const result = mapSettlement(data, captain.name);
    set({ captains: get().captains.map(c => c.id === captainId ? { ...c, settlements: [result, ...c.settlements] } : c) });
    return result;
  },

  addOrderToCaptain: async () => {
    // Orders are created through the order workflow; finance is read-only for order creation.
  },
  resetToDefault: () => set({ captains: [], selectedCaptainId: null }),
}));

export const getCaptainFinancialSummary = (captain?: CaptainFinanceProfile) => {
  const orders = captain?.orders || [];
  const settlements = captain?.settlements || [];
  const totalItemAmount = orders.reduce((s,o) => s + o.orderAmount, 0);
  const totalDeliveryFees = orders.reduce((s,o) => s + o.deliveryFee, 0);
  const totalCaptainDeliveryEarnings = orders.reduce((s,o) => s + o.captainDeliveryFee, 0);
  const totalPlatformFee = orders.reduce((s,o) => s + o.platformFee, 0);
  const totalCashCollected = orders.reduce((s,o) => s + o.totalCashCollected, 0);
  const totalReturned = settlements.reduce((s,r) => s + r.amountReturned, 0);
  const foodOrders = orders.filter(o => o.category === 'food');
  const marketOrders = orders.filter(o => o.category === 'market');
  const foodSubtotal = foodOrders.reduce((s,o) => s + o.orderAmount, 0);
  const marketSubtotal = marketOrders.reduce((s,o) => s + o.orderAmount, 0);
  return {
    totalOrdersCount: orders.length,
    totalItemAmount, totalDeliveryFees, totalCaptainDeliveryEarnings, totalPlatformFee,
    totalCashCollected, totalReturned, totalReturnedCash: totalReturned, remainingCashInHand: Math.max(0,totalCashCollected-totalReturned),
    foodSubtotal, marketSubtotal,
    foodOrdersCount: foodOrders.length,
    foodCashCollected: foodOrders.reduce((s,o)=>s+o.totalCashCollected,0),
    marketOrdersCount: marketOrders.length,
    marketCashCollected: marketOrders.reduce((s,o)=>s+o.totalCashCollected,0),
    otherOrdersCount: orders.length-foodOrders.length-marketOrders.length,
  };
};
