import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UseAuthResult {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      console.log('[useAuth] Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // If we got a valid session, we're done loading
      if (session) {
        setIsLoading(false);
      }
    });

    // THEN initialize session (including OAuth code exchange if present)
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        console.log('[useAuth] Initial session check:', session?.user?.email ?? 'no session');
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('[useAuth] Error getting session:', error);
        // On auth error (like invalid refresh token), sign out to clear stale state
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore signout errors
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, isLoading, signOut };
}
