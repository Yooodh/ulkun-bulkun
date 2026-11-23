import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

const STORAGE_PAGE_SIZE = 100;
const STORAGE_REMOVE_BATCH_SIZE = 100;

export async function DELETE(req: NextRequest) {
  const token = req.headers
    .get('Authorization')
    ?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { error: dataError } = await supabaseAdmin.rpc(
      'delete_user_app_data',
      { p_user_id: user.id },
    );
    if (dataError) throw dataError;

    const avatarPaths: string[] = [];
    for (let offset = 0; ; offset += STORAGE_PAGE_SIZE) {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('avatar')
        .list(user.id, { limit: STORAGE_PAGE_SIZE, offset });

      if (listError) throw listError;
      avatarPaths.push(
        ...(files ?? [])
          .filter((file) => file.id)
          .map((file) => `${user.id}/${file.name}`),
      );

      if (!files || files.length < STORAGE_PAGE_SIZE) break;
    }

    for (
      let index = 0;
      index < avatarPaths.length;
      index += STORAGE_REMOVE_BATCH_SIZE
    ) {
      const { error: removeError } = await supabaseAdmin.storage
        .from('avatar')
        .remove(avatarPaths.slice(index, index + STORAGE_REMOVE_BATCH_SIZE));
      if (removeError) throw removeError;
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id,
    );
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
