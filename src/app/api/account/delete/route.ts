import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(req: NextRequest) {
  // 요청자 신원 확인
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');

  // 토큰으로 유저 정보 검증
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = user.id;

  try {
    // Storage 파일 삭제
    const { data: files } = await supabaseAdmin.storage
      .from('avatar')
      .list(userId);

    if (files && files.length > 0) {
      const filePaths = files.map((f) => `${userId}/${f.name}`);
      await supabaseAdmin.storage.from('avatar').remove(filePaths);
    }

    // records 삭제
    await supabaseAdmin.from('records').delete().eq('user_id', userId);

    // profile 삭제
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // auth 유저 삭제
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    );
  }
}
