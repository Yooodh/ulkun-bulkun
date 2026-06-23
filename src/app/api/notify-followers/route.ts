import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

webpush.setVapidDetails(
  'mailto:eogus2604@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: NextRequest) {
  // 내부 호출(DB 트리거)인지 검증
  const secret = req.headers.get('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user_id } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  try {
    // 해당 유저를 팔로우한 사람들 조회
    const { data: subs, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('subscriber_id')
      .eq('target_id', user_id);

    if (subsError) throw subsError;
    if (!subs || subs.length === 0) {
      return NextResponse.json({ ok: true, notified: 0 });
    }

    const subscriberIds = subs.map((s) => s.subscriber_id);

    // 작성자 닉네임 및 공개 여부 조회
    const { data: authorProfile } = await supabaseAdmin
      .from('profiles')
      .select('nickname, is_public')
      .eq('id', user_id)
      .single();

    // 비공개 유저면 알림 전송 안 함
    if (!authorProfile?.is_public) {
      return NextResponse.json({ ok: true, notified: 0 });
    }

    // 알림을 받을 팔로워들의 웹 푸시 알림 구독 정보 조회
    const { data: pushSubs, error: pushError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', subscriberIds)
      .eq('is_active', true);

    if (pushError) throw pushError;

    // 푸시 발송
    const results = await Promise.allSettled(
      (pushSubs ?? []).map((row) =>
        webpush.sendNotification(
          row.subscription as any,
          JSON.stringify({
            title: '새로운 운동 기록!',
            body: `${authorProfile?.nickname ?? '울끈불끈이'}님이 새 기록을 올렸어요 💪`,
            url: `/members/${user_id}`,
          }),
        ),
      ),
    );
    return NextResponse.json({ ok: true, notified: results.length });
  } catch (error) {
    console.error('Notify followers error:', error);
    return NextResponse.json(
      { error: 'Failed to notify followers' },
      { status: 500 },
    );
  }
}
