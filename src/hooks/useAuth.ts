import { useState, useEffect } from 'react';
import { authService, dbService } from '../services/supabase';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    authService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Check if profile exists, create if it doesn't
        const { data: profile } = await dbService.getProfile(session.user.id);
        if (!profile) {
          console.log('Creating profile for new user');
          await dbService.createProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.name || 'Agent'
          );
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state');
        setUser(null);
        setLoading(false);
      } else {
        setUser(session?.user || null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authService.signIn(email, password);
    return { data, error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await authService.signUp(email, password, name);
    return { data, error };
  };

  const signOut = async () => {
    console.log('Starting fast logout process...');
    
    try {
      // Clear user state immediately for instant UI feedback
      setUser(null);
      setLoading(false);
      
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call Supabase signOut (don't wait for it)
      authService.signOut().catch(error => {
        console.warn('Supabase signOut error (non-critical):', error);
      });
      
      // Immediate redirect for fast user experience
      window.location.href = '/';
      
      return { error: null };
    } catch (error) {
      console.error('Error in signOut:', error);
      // Force redirect even if there's an error
      window.location.href = '/';
      return { error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};