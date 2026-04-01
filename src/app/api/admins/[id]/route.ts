import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 更新管理员
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminRole = request.headers.get('x-admin-role');
    const { id } = await params;

    if (adminRole !== 'super_admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const client = getSupabaseClient();
    
    // 检查管理员是否存在
    const { data: existing, error: queryError } = await client
      .from('admins')
      .select('id, role')
      .eq('id', id)
      .maybeSingle();

    if (queryError || !existing) {
      return NextResponse.json({ error: '管理员不存在' }, { status: 404 });
    }

    const body = await request.json();
    const { username, password, name, role } = body;

    // 检查用户名是否被其他管理员占用
    if (username) {
      const { data: duplicate } = await client
        .from('admins')
        .select('id')
        .eq('username', username)
        .neq('id', id)
        .maybeSingle();

      if (duplicate) {
        return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
      }
    }

    const updateData: Record<string, string> = {};
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (name) updateData.name = name;
    if (role && existing.role !== 'super_admin') updateData.role = role;

    const { data, error } = await client
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select('id, username, name, role, created_at, last_login')
      .single();

    if (error) {
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
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

// 删除管理员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminRole = request.headers.get('x-admin-role');
    const { id } = await params;

    if (adminRole !== 'super_admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const client = getSupabaseClient();

    // 检查是否是超级管理员
    const { data: existing, error: queryError } = await client
      .from('admins')
      .select('role')
      .eq('id', id)
      .maybeSingle();

    if (queryError || !existing) {
      return NextResponse.json({ error: '管理员不存在' }, { status: 404 });
    }

    if (existing.role === 'super_admin') {
      return NextResponse.json({ error: '无法删除超级管理员' }, { status: 400 });
    }

    const { error } = await client
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
