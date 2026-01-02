import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { seedDefaultRules, userHasRules } from '@/lib/defaultRules';

interface UserInitContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  userId: string | null;
}

const UserInitContext = createContext<UserInitContextType>({
  isInitialized: false,
  isInitializing: true,
  userId: null,
});

export function useUserInit() {
  return useContext(UserInitContext);
}

interface Props {
  children: ReactNode;
}

/**
 * Provider that initializes user data (seeds default rules) on first login
 */
export function UserInitProvider({ children }: Props) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async (uid: string) => {
      console.log('[UserInit] Initializing user:', uid);
      setIsInitializing(true);

      try {
        // Check if user has rules, if not, seed defaults
        const hasRules = await userHasRules(uid);
        if (!hasRules) {
          console.log('[UserInit] No rules found, seeding defaults...');
          await seedDefaultRules(uid);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('[UserInit] Error initializing user:', error);
        // Still mark as initialized to not block the app
        setIsInitialized(true);
      } finally {
        setIsInitializing(false);
      }
    };

    // Check current session
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await initializeUser(user.id);
      } else {
        setIsInitializing(false);
        setIsInitialized(true); // No user = nothing to initialize
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUserId = session?.user?.id ?? null;
        setUserId(newUserId);

        if (newUserId && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Use setTimeout to avoid potential Supabase deadlock
          setTimeout(() => {
            initializeUser(newUserId);
          }, 0);
        } else if (!newUserId) {
          setIsInitialized(true);
          setIsInitializing(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserInitContext.Provider value={{ isInitialized, isInitializing, userId }}>
      {children}
    </UserInitContext.Provider>
  );
}
