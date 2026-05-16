'use client';

import Image from 'next/image';
import { toast } from 'sonner';

import styles from './AuthForm.module.scss';

import Button from '../shared/Button/Button';
import Loading from '../shared/Loading/Loading';
import { ConfirmToast } from '@/components/shared/ConfirmToast/ConfirmToast';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export default function AuthForm() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { data: myProfile } = useProfile(user?.id);

  if (authLoading) {
    return (
      <div className={styles.authContainer}>
        <Loading size='sm' message='로그인 정보를 확인하고 있어요!' />
      </div>
    );
  }

  if (user) {
    const rawName =
      myProfile?.nickname ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      '울끈불끈이';

    const displayName = rawName.slice(0, 10);

    return (
      <div className={styles.loginContainer}>
        <p>
          <strong>{displayName}</strong>님, 오늘도 득근!
        </p>

        <Button
          variant='gray'
          size='sm'
          onClick={() => {
            ConfirmToast('로그아웃 하시겠습니까?', async () => {
              try {
                await signOut();
                toast.info('로그아웃 되었습니다. 내일도 득근!');
                window.location.href = '/';
              } catch (error) {
                toast.error(
                  `로그아웃 중 오류 발생: ${(error as Error).message}`,
                );
              }
            });
          }}
        >
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <h1>울끈불끈 시작하기 🔥</h1>

      <button className={styles.googleBtn} onClick={signInWithGoogle}>
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
