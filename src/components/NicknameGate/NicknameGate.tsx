'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

import Button from '@/components/shared/Button/Button';
import Loading from '@/components/shared/Loading/Loading';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

import { isValidNickname, normalizeNickname } from '@/utils/nicknameUtils';

import styles from './NicknameGate.module.scss';

type NicknameGateProps = {
  children: ReactNode;
};

export default function NicknameGate({ children }: NicknameGateProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch,
  } = useProfile(user?.id);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      toast.error('로그아웃에 실패했어요. 다시 시도해 주세요.');
    }
  };

  if (authLoading) {
    return (
      <Loading fullHeight size='lg' message='로그인 정보를 확인하고 있어요.' />
    );
  }

  if (!user) return children;

  if (profileLoading) {
    return <Loading fullHeight size='lg' message='프로필을 확인하고 있어요.' />;
  }

  if (profileError) {
    return (
      <div className={styles.gate}>
        <section className={styles.card}>
          <h1>프로필을 불러오지 못했어요</h1>
          <p>인터넷 연결을 확인한 뒤 다시 시도해 주세요.</p>
          <Button variant='blue' onClick={() => void refetch()}>
            다시 시도
          </Button>
          <Button variant='ligray' onClick={() => void handleSignOut()}>
            로그아웃
          </Button>
        </section>
      </div>
    );
  }

  if (!profile || !isValidNickname(profile.nickname)) {
    return (
      <NicknameSetup
        user={user}
        currentNickname={profile?.nickname}
        profileExists={!!profile}
        onSignOut={handleSignOut}
      />
    );
  }

  return children;
}

type NicknameSetupProps = {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  currentNickname?: string;
  profileExists: boolean;
  onSignOut: () => Promise<void>;
};

function NicknameSetup({
  user,
  currentNickname,
  profileExists,
  onSignOut,
}: NicknameSetupProps) {
  const queryClient = useQueryClient();
  const suggestion = normalizeNickname(
    currentNickname ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      '',
  );
  const [nickname, setNickname] = useState(() =>
    isValidNickname(suggestion) ? suggestion : '',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedNickname = normalizeNickname(nickname);

    if (!isValidNickname(normalizedNickname)) {
      setErrorMessage('한글, 영문 소문자, 숫자로 2~10자 입력해 주세요.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const profileValues = {
      id: user.id,
      nickname: normalizedNickname,
      status_message: '울끈불끈!',
      avatar_url:
        user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      is_public: true,
      weight: null,
      gender: null,
      birth_date: null,
      background_color: '#e3f2fd',
      updated_at: new Date().toISOString(),
    };

    const { error } = profileExists
      ? await supabase
          .from('profiles')
          .update({
            nickname: normalizedNickname,
            updated_at: profileValues.updated_at,
          })
          .eq('id', user.id)
      : await supabase.from('profiles').upsert(profileValues);

    if (error) {
      setErrorMessage(
        error.code === '23505'
          ? '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.'
          : '닉네임을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
      setSaving(false);
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] }),
      queryClient.invalidateQueries({ queryKey: ['users'] }),
    ]);
    setSaving(false);
  };

  return (
    <div className={styles.gate}>
      <div className={styles.content}>
        <section className={styles.card}>
          <h1>닉네임을 설정해 주세요</h1>
          <p>
            계속하려면 닉네임 설정이 필요해요. 한글, 영문, 숫자를 2~10자로
            입력할 수 있고 영문은 소문자로 저장됩니다.
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <input
                id='nickname-setup'
                type='text'
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder='한글, 영문 소문자, 숫자 (2~10자)'
                maxLength={10}
                autoComplete='nickname'
                autoCapitalize='none'
                autoFocus
              />
              <span>{nickname.length}/10</span>
            </div>
            {errorMessage && (
              <p className={styles.error} role='alert'>
                {errorMessage}
              </p>
            )}
            <div className={styles.actions}>
              <Button type='submit' size='lg' variant='blue' disabled={saving}>
                {saving ? '저장 중...' : '시작하기'}
              </Button>
              <Button
                type='button'
                variant='ligray'
                size='lg'
                onClick={() => void onSignOut()}
              >
                로그아웃
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
