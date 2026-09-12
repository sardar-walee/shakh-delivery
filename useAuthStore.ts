import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { useThemeStore } from './useThemeStore';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

export const ALL_SYSTEM_ROLES = [
  { id: 'role-sa', role: 'SUPER_ADMIN', labelKu: 'بەڕێوەبەری گشتی', labelAr: 'المدير العام', labelEn: 'Super Admin', scope: 'all' },
  { id: 'role-admin', role: 'ADMIN', labelKu: 'بەڕێوەبەر', labelAr: 'مدير', labelEn: 'Admin', scope: 'all' },
  { id: 'role-support', role: 'SUPPORT', labelKu: 'پشتیوانی', labelAr: 'الدعم', labelEn: 'Support', scope: 'all' },
  { id: 'role-captain', role: 'CAPTAIN', labelKu: 'کاپتن', labelAr: 'سائق', labelEn: 'Captain', scope: 'delivery' },
  { id: 'role-restaurant', role: 'RESTAURANT', labelKu: 'چێشتخانە', labelAr: 'مطعم', labelEn: 'Restaurant', scope: 'food' },
  { id: 'role-market', role: 'SUPERMARKET', labelKu: 'سوپەرمارکێت', labelAr: 'سوبرماركت', labelEn: 'Supermarket', scope: 'market' },
  { id: 'role-fashion', role: 'FASHION', labelKu: 'جلوبەرگ', labelAr: 'أزياء', labelEn: 'Fashion', scope: 'fashion' },
  { id: 'role-umrah', role: 'UMRAH', labelKu: 'عومرە', labelAr: 'عمرة', labelEn: 'Umrah', scope: 'umrah' },
  { id: 'role-car', role: 'CAR_SELLER', labelKu: 'فرۆشیاری ئۆتۆمبێل', labelAr: 'سيارات', labelEn: 'Car Seller', scope: 'cars' },
  { id: 'role-beauty', role: 'BEAUTY', labelKu: 'جوانی', labelAr: 'تجميل', labelEn: 'Beauty', scope: 'beauty' },
  { id: 'role-customer', role: 'CUSTOMER', labelKu: 'کڕیار', labelAr: 'عميل', labelEn: 'Customer', scope: 'customer' },
];

interface AuthState {
  user: any | null; profile: Profile | null; roles: UserRole[]; activeRole: string | null; loading: boolean;
  initialize: () => Promise<void>; signOut: () => Promise<void>;
  signInWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  setActiveRole: (role: string) => void;
}

const hydrate = async (session: any, set: any, get: any) => {
  if (!session) { set({ user: null, profile: null, roles: [], activeRole: null, loading: false }); return; }
  set({ user: session.user, loading: true });
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
    supabase.from('user_roles').select('*').eq('user_id', session.user.id).eq('status', 'approved'),
  ]);
  if (profile?.theme_preference) useThemeStore.getState().applyUserPreference(profile.theme_preference);
  const userRoles = (roles || []) as UserRole[];
  set({ profile: profile || null, roles: userRoles, activeRole: get().activeRole || userRoles[0]?.role || 'CUSTOMER', loading: false });
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, profile: null, roles: [], activeRole: null, loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await hydrate(session, set, get);
    supabase.auth.onAuthStateChange(async (_event, nextSession) => { await hydrate(nextSession, set, get); });
  },

  signOut: async () => { await supabase.auth.signOut(); set({ user: null, profile: null, roles: [], activeRole: null, loading: false }); },

  signInWithGoogle: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) { set({ loading: false }); throw error; }
  },

  setActiveRole: (role) => set({ activeRole: role }),
}));
