import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  isDark: boolean;
  isSyncing: boolean;
  setTheme: (theme: ThemeMode, userId?: string) => Promise<void>;
  toggleTheme: (userId?: string) => Promise<void>;
  applyUserPreference: (preference?: string | null) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';

  // Prefer the user's system preference before authentication; authenticated preferences are loaded from Supabase.
  // Check document element class
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }

  // 3. Fallback to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Apply initial theme immediately to prevent flash
const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  isDark: initialTheme === 'dark',
  isSyncing: false,

  setTheme: async (newTheme: ThemeMode, explicitUserId?: string) => {
    // 1. Update DOM and local state immediately for instant feedback
    applyThemeToDOM(newTheme);
    set({ theme: newTheme, isDark: newTheme === 'dark' });

    // 2. Persist to Supabase Profile if user is logged in
    try {
      let targetUserId = explicitUserId;

      if (!targetUserId) {
        const { data } = await supabase.auth.getSession();
        targetUserId = data.session?.user?.id;
      }

      if (targetUserId) {
        set({ isSyncing: true });
        
        // Update Supabase profile table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            theme_preference: newTheme,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);

        if (profileError) {
          console.warn('Could not sync theme_preference to profiles table:', profileError.message);
        }

        // Also update Auth metadata for persistent cross-session retention
        await supabase.auth.updateUser({
          data: { theme_preference: newTheme },
        }).catch((e) => console.warn('Auth user metadata theme update note:', e));
      }
    } catch (err) {
      console.error('Error persisting theme preference to Supabase:', err);
    } finally {
      set({ isSyncing: false });
    }
  },

  toggleTheme: async (userId?: string) => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    await get().setTheme(nextTheme, userId);
  },

  applyUserPreference: (preference?: string | null) => {
    if (!preference) return;
    const normalized = preference.toLowerCase();
    if (normalized === 'dark' || normalized === 'light') {
      const targetTheme = normalized as ThemeMode;
      if (get().theme !== targetTheme) {
        applyThemeToDOM(targetTheme);
        set({ theme: targetTheme, isDark: targetTheme === 'dark' });
      }
    }
  },
}));
