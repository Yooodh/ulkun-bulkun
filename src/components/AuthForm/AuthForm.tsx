'use client';

import Image from 'next/image';
import styles from './AuthForm.module.scss';
import { useAuth } from '@/hooks/useAuth';
import Button from '../shared/Button/Button';

export default function AuthForm() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) return <div className={styles.authContainer}>로그인 중...</div>;

  if (user) {
    const displayName = user.user_metadata?.full_name || user.email;

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
