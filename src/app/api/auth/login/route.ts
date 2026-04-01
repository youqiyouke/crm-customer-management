import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: '登录失败' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // 更新最后登录时间
    await client
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);

    // 返回用户信息（不返回密码）
    const admin = {
      id: data.id,
      username: data.username,
      name: data.name,
      role: data.role,
      createdAt: data.created_at,
      lastLogin: new Date().toISOString(),
    };

    return NextResponse.json({ admin });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
