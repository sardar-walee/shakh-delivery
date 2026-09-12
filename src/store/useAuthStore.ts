import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { useThemeStore } from './useThemeStore';
import { isValidUUID, getConsistentUUID } from '../utils/uuid';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

const SUPER_ADMIN_EMAILS = [
  'shakh8002@gmail.com',
  'sardar.xano59@gmail.com',
];

interface AuthState {
  user: any | null;
  profile: Profile | null;
  roles: UserRole[];
  activeRole: string | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  setActiveRole: (role: string) => void;
}

export const ALL_SYSTEM_ROLES = [
  { id: 'role-sa', role: 'SUPER_ADMIN', labelKu: 'پلاتفۆرمی شاخ ستۆر (دەسەڵاتی پۆست لە هەموو بەشەکان)', labelAr: 'منصة شاخ ستور (نشر في كافة الأقسام)', labelEn: 'SHAKH Store Platform (Full Access All Categories)', scope: 'all' },
  { id: 'role-admin', role: 'ADMIN', labelKu: 'بەڕێوەبەری ئۆپەراسیۆن (Operations Admin)', labelAr: 'إدارة العمليات', labelEn: 'Operations Admin', scope: 'all' },
  { id: 'role-support', role: 'SUPPORT', labelKu: 'پشتگیری و خزمەتگوزاری بەشداربووان', labelAr: 'الدعم الفني والشكاوى', labelEn: 'Support & Helpdesk', scope: 'all' },
  { id: 'role-captain', role: 'CAPTAIN', labelKu: 'کاپتن و گەیاندن (Courier Fleet)', labelAr: 'كابتن توصيل', labelEn: 'Delivery Captain', scope: 'captain' },
  { id: 'role-fashion', role: 'FASHION_MERCHANT', labelKu: 'فرۆشگای جل و بەرگ (تەنها جلوبەرگ)', labelAr: 'متجر الأزياء والملابس (أزياء فقط)', labelEn: 'Fashion Store (Fashion Only)', scope: 'fashion' },
  { id: 'role-cars', role: 'CARS_MERCHANT', labelKu: 'پێشانگای ئۆتۆمبێل (تەنها IQ Cars)', labelAr: 'معرض السيارات (IQ Cars فقط)', labelEn: 'Car Dealership (Cars Only)', scope: 'cars' },
  { id: 'role-food', role: 'FOOD_MERCHANT', labelKu: 'چێشتخانە و فاست فوود (تەنها خواردن)', labelAr: 'مطعم ومأكولات (أطعمة فقط)', labelEn: 'Food & Dining (Food Only)', scope: 'food' },
  { id: 'role-market', role: 'MARKET_MERCHANT', labelKu: 'سوپەرمارکێت و خۆراک (تەنها مارکێت)', labelAr: 'سوبرماركت ومواد غذائية (ماركت فقط)', labelEn: 'Supermarket (Market Only)', scope: 'market' },
  { id: 'role-tech', role: 'TECH_MERCHANT', labelKu: 'فرۆشگای تەکنەلۆژیا و مۆبایل (تەنها تەکنەلۆژیا)', labelAr: 'متجر الإلكترونيات والموبايل (إلكترونيات فقط)', labelEn: 'Tech & Mobiles (Tech Only)', scope: 'tech' },
  { id: 'role-customer', role: 'CUSTOMER', labelKu: 'بەکارهێنەر و کڕیار (Customer)', labelAr: 'عميل ومستخدم عادي', labelEn: 'Customer / Buyer', scope: 'customer' },
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  roles: [],
  activeRole: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ user: null, profile: null, roles: [], activeRole: null, loading: false });
        return;
      }

      const userEmail = session.user.email?.toLowerCase() || '';
      const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(userEmail);

      set({ user: session.user });

      // Fetch or auto-create profile
      let userProfile: Profile | null = null;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          userProfile = profile;
          set({ profile });
          if (profile.theme_preference) {
            useThemeStore.getState().applyUserPreference(profile.theme_preference);
          } else if (session.user.user_metadata?.theme_preference) {
            useThemeStore.getState().applyUserPreference(session.user.user_metadata.theme_preference);
          }
        } else {
          // Create initial profile for authenticated user
          const initialProfile: Profile = {
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || null,
            phone: session.user.user_metadata?.phone || null,
            avatar: session.user.user_metadata?.avatar_url || null,
            language: 'ku',
            status: 'active',
            theme_preference: 'dark',
            fcm_token: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          try {
            await supabase.from('profiles').insert({
              id: initialProfile.id,
              full_name: initialProfile.full_name,
              email: initialProfile.email,
              phone: initialProfile.phone,
              avatar: initialProfile.avatar,
              language: initialProfile.language,
              status: initialProfile.status,
            });
            userProfile = initialProfile;
            set({ profile: initialProfile });
          } catch {
            set({ profile: initialProfile });
          }
        }
      } catch (err) {
        console.warn('Profile fetch note:', err);
      }

      // If user is super admin email, ensure database role record is persisted
      if (isSuperAdminEmail) {
        try {
          await supabase.from('user_roles').upsert({
            user_id: session.user.id,
            role: 'SUPER_ADMIN',
            status: 'approved',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,role' });
        } catch {
          // ignore if table constraint differs
        }
      }

      // Fetch roles safely
      try {
        const { data: dbRoles, error: rolesErr } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'approved');

        let userRolesList: UserRole[] = [];

        if (!rolesErr && dbRoles && dbRoles.length > 0) {
          userRolesList = [...dbRoles];
        }

        // Ensure super admin is included if designated
        if (isSuperAdminEmail) {
          if (!userRolesList.some(r => r.role === 'SUPER_ADMIN')) {
            userRolesList.unshift({
              id: 'super-admin-role',
              user_id: session.user.id,
              role: 'SUPER_ADMIN',
              status: 'approved',
              approved_by: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }

        // Auto-assign default CUSTOMER role if user has no roles yet
        if (userRolesList.length === 0) {
          try {
            await supabase.from('user_roles').insert({
              user_id: session.user.id,
              role: 'CUSTOMER',
              status: 'approved',
            });
          } catch {
            // ignore
          }
          userRolesList = [
            { id: 'def-cust', user_id: session.user.id, role: 'CUSTOMER', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          ];
        }

        set({ roles: userRolesList });

        if (!get().activeRole) {
          if (isSuperAdminEmail) {
            set({ activeRole: 'SUPER_ADMIN' });
          } else {
            const hasCustomer = userRolesList.some((r) => r.role === 'CUSTOMER');
            set({ activeRole: hasCustomer ? 'CUSTOMER' : userRolesList[0].role });
          }
        }
      } catch {
        const defaultRoles: UserRole[] = [
          { id: 'def-cust', user_id: session.user.id, role: 'CUSTOMER', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        if (isSuperAdminEmail) {
          defaultRoles.unshift({ id: 'def-sa', user_id: session.user.id, role: 'SUPER_ADMIN', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        }
        set({
          roles: defaultRoles,
          activeRole: isSuperAdminEmail ? 'SUPER_ADMIN' : 'CUSTOMER',
        });
      }

    } catch (error) {
      console.warn('Auth initialization note:', error);
    } finally {
      set({ loading: false });
    }

    // Set up auth listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) {
        if (session) {
          const userEmail = session.user.email?.toLowerCase() || '';
          const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(userEmail);
          set({ user: session.user });
          
          let profileData = null;
          try {
            const pRes = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
            profileData = pRes.data;
          } catch {
            // Profile fallback
          }

          let rolesData: any[] = [];
          try {
            const rolesRes = await supabase.from('user_roles').select('*').eq('user_id', session.user.id).eq('status', 'approved');
            if (rolesRes.data && rolesRes.data.length > 0) {
              rolesData = rolesRes.data;
            }
          } catch {
            // user_roles fallback
          }

          if (isSuperAdminEmail) {
            if (!rolesData.some(r => r.role === 'SUPER_ADMIN')) {
              rolesData.unshift({
                id: 'super-admin-role',
                user_id: session.user.id,
                role: 'SUPER_ADMIN',
                status: 'approved',
                approved_by: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }

          if (rolesData.length === 0) {
            try {
              await supabase.from('user_roles').insert({
                user_id: session.user.id,
                role: 'CUSTOMER',
                status: 'approved',
              });
            } catch {
              // ignore
            }
            rolesData = [
              { id: 'def-cust', user_id: session.user.id, role: 'CUSTOMER', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
            ];
          }

          if (profileData?.theme_preference) {
            useThemeStore.getState().applyUserPreference(profileData.theme_preference);
          } else if (session.user.user_metadata?.theme_preference) {
            useThemeStore.getState().applyUserPreference(session.user.user_metadata.theme_preference);
          }

          set({ 
            profile: profileData, 
            roles: rolesData,
            activeRole: isSuperAdminEmail ? 'SUPER_ADMIN' : (get().activeRole || rolesData[0].role),
            loading: false 
          });
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, roles: [], activeRole: null, loading: false });
      }
    });
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    set({ user: null, profile: null, roles: [], activeRole: null, loading: false });
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        console.error("Google Auth error", error);
        set({ loading: false });
        throw error;
      }
    } catch (err) {
      console.error("Google Auth error", err);
      set({ loading: false });
      throw err;
    }
  },

  setActiveRole: (role: string) => {
    set({ activeRole: role });
  }
}));
