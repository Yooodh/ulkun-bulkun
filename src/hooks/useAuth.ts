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
    // 초기 로드 시 세션 확인
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // 로그인 상태 변화 감지
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
        // 로그인 완료 후 다시 돌아올 주소
        redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
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
    const confirmLogout = window.confirm('로그아웃 하시겠습니까?');

    if (!confirmLogout) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      alert('로그아웃 되었습니다. 내일도 득근!');

      window.location.href = '/';
    } catch (error) {
      if (error instanceof Error) {
        alert(`로그아웃 중 오류 발생: ${error.message}`);
      }
    }
  };

  return { user, loading, signUp, signIn, signInWithGoogle, signOut };
}
