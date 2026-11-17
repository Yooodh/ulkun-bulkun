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

  let recordId: unknown;
  try {
    ({ record_id: recordId } = await req.json());
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }
  if (typeof recordId !== 'string' || !UUID_PATTERN.test(recordId)) {
    return NextResponse.json({ error: 'Invalid record_id' }, { status: 400 });
  }

  try {
    const { data: record, error: recordError } = await supabaseAdmin
      .from('records')
      .select('id')
      .eq('id', recordId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .maybeSingle();

    if (recordError) throw recordError;
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const { error: claimError } = await supabaseAdmin
      .from('notification_events')
      .insert({ event_key: `record-completed:${record.id}` });

    if (claimError?.code === '23505') {
      return NextResponse.json({ ok: true, notified: 0, duplicate: true });
    }
    if (claimError) throw claimError;

    const { data: authorProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('nickname, is_public')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!authorProfile?.is_public) {
      return NextResponse.json({ ok: true, notified: 0 });
    }

    const { data: subs, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('subscriber_id')
      .eq('target_id', user.id);

    if (subsError) throw subsError;
    const subscriberIds = [
      ...new Set((subs ?? []).map((s) => s.subscriber_id)),
    ];
    if (subscriberIds.length === 0) {
      return NextResponse.json({ ok: true, notified: 0 });
    }

    const { data: pushSubs, error: pushError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', subscriberIds)
      .eq('is_active', true);

    if (pushError) throw pushError;

    const results = await Promise.allSettled(
      (pushSubs ?? []).map((row) =>
        webpush.sendNotification(
          row.subscription as PushSubscription,
          JSON.stringify({
            title: '새로운 운동 기록!',
            body: `${authorProfile.nickname ?? '울끈불끈이'}님이 새 기록을 올렸어요 💪`,
            url: `/members/${encodeURIComponent(authorProfile.nickname ?? user.id)}`,
          }),
        ),
      ),
    );
    return NextResponse.json({
      ok: true,
      notified: results.filter((result) => result.status === 'fulfilled')
        .length,
    });
  } catch (error) {
    console.error('Notify followers error:', error);
    return NextResponse.json(
      { error: 'Failed to notify followers' },
      { status: 500 },
    );
  }
}
