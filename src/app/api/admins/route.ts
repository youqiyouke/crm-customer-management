import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取管理员列表
export async function GET(request: NextRequest) {
  try {
    const adminRole = request.headers.get('x-admin-role');

    if (adminRole !== 'super_admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('admins')
      .select('id, username, name, role, created_at, last_login')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    const admins = (data || []).map((item) => ({
      id: item.id,
      username: item.username,
      name: item.name,
      role: item.role,
      createdAt: item.created_at,
      lastLogin: item.last_login,
    }));

    return NextResponse.json({ admins });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建管理员
export async function POST(request: NextRequest) {
  try {
    const adminRole = request.headers.get('x-admin-role');

    if (adminRole !== 'super_admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, name, role } = body;

    if (!username || !password || !name) {
      return NextResponse.json({ error: '信息不完整' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查用户名是否已存在
    const { data: existing } = await client
      .from('admins')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
    }

    const { data, error } = await client
      .from('admins')
      .insert({
        username,
        password,
        name,
        role: role || 'admin',
        created_at: new Date().toISOString(),
      })
      .select('id, username, name, role, created_at, last_login')
      .single();

    if (error) {
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    return NextResponse.json({
      admin: {
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role,
        createdAt: data.created_at,
        lastLogin: data.last_login,
      },
    });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
