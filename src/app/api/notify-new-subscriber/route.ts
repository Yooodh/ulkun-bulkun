import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

webpush.setVapidDetails(
  'mailto:eogus2604@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const subscriber_id = user.id;
  const { target_id } = await req.json();

  if (!subscriber_id || !target_id) {
    return NextResponse.json(
      { error: 'subscriber_id, target_id is required' },
      { status: 400 },
    );
  }

  try {
    // 나를 팔로우한 사람(팔로워)의 닉네임 조회
    const { data: subscriberProfile } = await supabaseAdmin
      .from('profiles')
      .select('nickname')
      .eq('id', subscriber_id)
      .single();

    // 팔로우 당한 사람(팔로잉)의 웹 푸시 알림 구독 정보 조회
    const { data: pushSub, error: pushError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', target_id)
      .eq('is_active', true)
      .maybeSingle();

    if (pushError) throw pushError;
    if (!pushSub) {
      return NextResponse.json({ ok: true, notified: 0 });
    }

    // 알림 발송
    await webpush.sendNotification(
      pushSub.subscription as any,
      JSON.stringify({
        title: '새로운 팔로워!',
        body: `${subscriberProfile?.nickname ?? '울끈불끈이'}님이 나를 팔로우했어요 🔔`,
        url: `/members/${subscriber_id}`,
      }),
    );

    return NextResponse.json({ ok: true, notified: 1 });
  } catch (error) {
    console.error('Notify new subscriber error:', error);
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 });
  }
}
