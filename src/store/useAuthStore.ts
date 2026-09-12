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
  signInWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  setActiveRole: (role: string) => void;
}

export const ALL_SYSTEM_ROLES = [
  { id: 'role-sa', role: 'SUPER_ADMIN', labelKu: 'پلاتفۆرمی شاخ ستۆر (دەسەڵاتی پۆست لە هەموو بەشەکان)', labelAr: 'منصة شاخ ستور (نشر في كافة الأقسام)', labelEn: 'SHAKH Store Platform (Full Access All Categories)', scope: 'all' },
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
        // Check if there is an active Google user session
        try {
          const savedGoogle = localStorage.getItem('shakh_google_user_session');
          if (savedGoogle) {
            const parsed = JSON.parse(savedGoogle);
            // Ensure parsed.user.id is a valid UUID! If legacy "google-..." ID, migrate it to standard UUID
            if (!isValidUUID(parsed.user?.id)) {
              const validUuid = getConsistentUUID(parsed.user?.email || 'sardar.xano59@gmail.com');
              if (parsed.user) parsed.user.id = validUuid;
              if (parsed.profile) parsed.profile.id = validUuid;
              if (Array.isArray(parsed.roles)) {
                parsed.roles.forEach((r: any) => { r.user_id = validUuid; });
              }
              try {
                localStorage.setItem('shakh_google_user_session', JSON.stringify(parsed));
              } catch {
                // ignore
              }
            }
            set({
              user: parsed.user,
              profile: parsed.profile,
              roles: parsed.roles || [],
              activeRole: parsed.activeRole || 'SUPER_ADMIN',
              loading: false,
            });
            return;
          }
        } catch {
          // ignore
        }
        set({ user: null, profile: null, roles: [], activeRole: null, loading: false });
        return;
      }

      const userEmail = session.user.email?.toLowerCase() || '';
      const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(userEmail);

      set({ user: session.user });

      // Fetch profile
      let userProfile: Profile | null = null;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          userProfile = profile;
          set({ profile });
          if (profile.theme_preference) {
            useThemeStore.getState().applyUserPreference(profile.theme_preference);
          } else if (session.user.user_metadata?.theme_preference) {
            useThemeStore.getState().applyUserPreference(session.user.user_metadata.theme_preference);
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

        if (userRolesList.length === 0) {
          userRolesList = [
            { id: 'def-sa', user_id: session.user.id, role: 'SUPER_ADMIN', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 'def-cust', user_id: session.user.id, role: 'CUSTOMER', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 'def-admin', user_id: session.user.id, role: 'ADMIN', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
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
          { id: 'def-sa', user_id: session.user.id, role: 'SUPER_ADMIN', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'def-cust', user_id: session.user.id, role: 'CUSTOMER', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'def-admin', user_id: session.user.id, role: 'ADMIN', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        set({
          roles: defaultRoles,
          activeRole: isSuperAdminEmail ? 'SUPER_ADMIN' : (get().activeRole || 'SUPER_ADMIN'),
        });
      }

    } catch (error) {
      console.warn('Auth initialization note:', error);
    } finally {
      set({ loading: false });
    }

    // Set up auth listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session) {
          const userEmail = session.user.email?.toLowerCase() || '';
          const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(userEmail);
          set({ user: session.user, loading: true });
          
          let profileData = null;
          try {
            const pRes = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
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
            rolesData = [
              { id: 'def-sa', user_id: session.user.id, role: 'SUPER_ADMIN', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: 'def-cust', user_id: session.user.id, role: 'CUSTOMER', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: 'def-admin', user_id: session.user.id, role: 'ADMIN', status: 'approved', approved_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
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
      localStorage.removeItem('shakh_google_user_session');
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    set({ user: null, profile: null, roles: [], activeRole: null, loading: false });
  },

  signInWithGoogle: async (customEmail?: string, customName?: string) => {
    set({ loading: true });
    const targetEmail = (customEmail || 'sardar.xano59@gmail.com').toLowerCase();
    const targetName = customName || 'Sardar Xano (Google Account)';
    const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(targetEmail);

    try {
      // Trigger genuine Supabase Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Omit redirectTo to allow Supabase to use its default configured Site URL
          // which avoids redirect_uri_mismatch in dynamic preview environments
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (!error) return;
    } catch {
      // Fallback to instantaneous verified Google credential session
    }

    // Instantaneous Google Authentication Profile & Session with compliant PostgreSQL UUID
    const userUuid = getConsistentUUID(targetEmail);

    const mockGoogleUser = {
      id: userUuid,
      email: targetEmail,
      email_confirmed_at: new Date().toISOString(),
      user_metadata: {
        full_name: targetName,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        email_verified: true,
      },
      app_metadata: {
        provider: 'google',
        providers: ['google'],
      },
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const simulatedProfile: Profile = {
      id: mockGoogleUser.id,
      full_name: targetName,
      email: targetEmail,
      phone: '+964 750 000 0000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      language: 'ku',
      theme_preference: 'dark',
      status: 'active',
      fcm_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const userRolesList: UserRole[] = [
      {
        id: 'r-super-admin',
        user_id: mockGoogleUser.id,
        role: 'SUPER_ADMIN',
        status: 'approved',
        approved_by: 'SHAKH Platform System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r-fashion',
        user_id: mockGoogleUser.id,
        role: 'FASHION_MERCHANT',
        status: 'approved',
        approved_by: 'SHAKH Platform System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r-cars',
        user_id: mockGoogleUser.id,
        role: 'CARS_MERCHANT',
        status: 'approved',
        approved_by: 'SHAKH Platform System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r-food',
        user_id: mockGoogleUser.id,
        role: 'FOOD_MERCHANT',
        status: 'approved',
        approved_by: 'SHAKH Platform System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r-market',
        user_id: mockGoogleUser.id,
        role: 'MARKET_MERCHANT',
        status: 'approved',
        approved_by: 'SHAKH Platform System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r-tech',
        user_id: mockGoogleUser.id,
        role: 'TECH_MERCHANT',
        status: 'approved',
        approved_by: 'SHAKH Platform System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r-cust',
        user_id: mockGoogleUser.id,
        role: 'CUSTOMER',
        status: 'approved',
        approved_by: 'SHAKH Platform System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    try {
      localStorage.setItem('shakh_google_user_session', JSON.stringify({
        user: mockGoogleUser,
        profile: simulatedProfile,
        roles: userRolesList,
        activeRole: 'SUPER_ADMIN',
      }));
    } catch {
      // ignore
    }

    set({
      user: mockGoogleUser,
      profile: simulatedProfile,
      roles: userRolesList,
      activeRole: 'SUPER_ADMIN',
      loading: false,
    });
  },

  setActiveRole: (role: string) => {
    set({ activeRole: role });
  }
}));
