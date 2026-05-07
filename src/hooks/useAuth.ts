import { useState, useEffect } from 'react';
import { User, AuthResponse, OAuthResponse } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

type AuthHook = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<AuthResponse['data']>;
  signIn: (email: string, pass: string) => Promise<AuthResponse['data']>;
  signInWithGoogle: () => Promise<OAuthResponse['data']>;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 소셜 로그인
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) throw error;
    return data;
  };

  // 이메일 회원가입
  const signUp = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  };

  // 이메일 로그인
  const signIn = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  };

  // 로그아웃
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, signUp, signIn, signInWithGoogle, signOut };
}
