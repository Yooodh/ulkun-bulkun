'use client';

import Image from 'next/image';

import styles from './AuthForm.module.scss';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

import Button from '../shared/Button/Button';
import Loading from '../shared/Loading/Loading';

export default function AuthForm() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className={styles.authContainer}>
        <Loading size='sm' message='로그인 정보를 확인하고 있어요!' />
      </div>
    );
  }

  if (user) {
    const displayName =
      profile?.nickname || user.user_metadata?.full_name || user.email;

    return (
      <div className={styles.loginContainer}>
        <p>
          <strong>{displayName}</strong>님, 오늘도 득근!
        </p>

        <Button variant='gray' size='sm' onClick={() => signOut()}>
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <h1>울끈불끈 시작하기 🔥</h1>

      <button
        className={styles.googleBtn}
        onClick={async () => {
          try {
            await signInWithGoogle();
          } catch (error) {
            alert('로그인 중 오류가 발생했습니다.');
          }
        }}
      >
        <Image
          src='/assets/images/google_logo.png'
          alt='Google'
          width={18}
          height={18}
        />
        구글로 1초 만에 로그인
      </button>

      <p>운동 기록은 안전하게 본인 계정에만 저장됩니다.</p>
    </div>
  );
}
