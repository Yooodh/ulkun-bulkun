import { NextRequest, NextResponse } from 'next/server';
import type { PushSubscription } from 'web-push';
import webpush from 'web-push';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

webpush.setVapidDetails(
  'mailto:eogus2604@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const token = req.headers
    .get('Authorization')
    ?.match(/^Bearer\s+(.+)$/i)?.[1];
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

  let targetId: unknown;
  try {
    ({ target_id: targetId } = await req.json());
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }
  if (typeof targetId !== 'string' || !UUID_PATTERN.test(targetId)) {
    return NextResponse.json({ error: 'Invalid target_id' }, { status: 400 });
  }
  if (targetId === user.id) {
    return NextResponse.json(
      { error: 'Cannot follow yourself' },
      { status: 400 },
    );
  }

  try {
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', user.id)
      .eq('target_id', targetId)
      .maybeSingle();

    if (subscriptionError) throw subscriptionError;
    if (!subscription) {
      return NextResponse.json(
        { error: 'Follow relationship not found' },
        { status: 404 },
      );
    }

    const { error: claimError } = await supabaseAdmin
      .from('notification_events')
      .insert({ event_key: `new-follower:${subscription.id}` });

    if (claimError?.code === '23505') {
      return NextResponse.json({ ok: true, notified: 0, duplicate: true });
    }
    if (claimError) throw claimError;

    const [
      { data: subscriberProfile, error: profileError },
      { data: pushSub, error: pushError },
    ] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .maybeSingle(),
      supabaseAdmin
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', targetId)
        .eq('is_active', true)
        .maybeSingle(),
    ]);

    if (profileError) throw profileError;
    if (pushError) throw pushError;
    if (!pushSub) return NextResponse.json({ ok: true, notified: 0 });

    await webpush.sendNotification(
      pushSub.subscription as PushSubscription,
      JSON.stringify({
        title: '새로운 팔로워!',
        body: `${subscriberProfile?.nickname ?? '울끈불끈이'}님이 나를 팔로우했어요 🔔`,
        url: `/members/${encodeURIComponent(subscriberProfile?.nickname ?? user.id)}`,
      }),
    );

    return NextResponse.json({ ok: true, notified: 1 });
  } catch (error) {
    console.error('Notify new subscriber error:', error);
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 });
  }
}
