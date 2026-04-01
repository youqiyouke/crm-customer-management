import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取单个客户
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const adminRole = request.headers.get('x-admin-id');
    const { id } = await params;

    if (!adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const client = getSupabaseClient();
    
    // 先查询客户
    const { data, error } = await client
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 });
    }

    // 权限检查：非超级管理员只能查看自己的客户
    if (adminRole !== 'super_admin' && data.owner_id !== adminId) {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    // 更新访问时间
    const now = new Date().toISOString();
    await client
      .from('customers')
      .update({ visit_time: now, updated_at: now })
      .eq('id', id);

    return NextResponse.json({
      customer: {
        id: data.id,
        name: data.name,
        phone: data.phone,
        company: data.company,
        status: data.status,
        tags: data.tags ? data.tags.split(',').filter(Boolean) : [],
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: now,
        visitTime: now,
        loanAmount: parseFloat(data.loan_amount || '0'),
        serviceFee: parseFloat(data.service_fee || '0'),
        ownerId: data.owner_id,
        ownerName: data.owner_name,
      },
    });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 更新客户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const adminRole = request.headers.get('x-admin-role');
    const { id } = await params;

    if (!adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const client = getSupabaseClient();

    // 先查询客户检查权限
    const { data: existing, error: queryError } = await client
      .from('customers')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();

    if (queryError || !existing) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 });
    }

    // 权限检查
    if (adminRole !== 'super_admin' && existing.owner_id !== adminId) {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, company, status, tags, notes, loanAmount, serviceFee } = body;

    const updateData: Record<string, string | number> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || '';
    if (company !== undefined) updateData.company = company || '';
    if (status !== undefined) updateData.status = status || 'need';
    if (tags !== undefined) updateData.tags = tags ? tags.join(',') : '';
    if (notes !== undefined) updateData.notes = notes || '';
    if (loanAmount !== undefined) updateData.loan_amount = loanAmount.toString();
    if (serviceFee !== undefined) updateData.service_fee = serviceFee.toString();

    const { data, error } = await client
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({
      customer: {
        id: data.id,
        name: data.name,
        phone: data.phone,
        company: data.company,
        status: data.status,
        tags: data.tags ? data.tags.split(',').filter(Boolean) : [],
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        visitTime: data.visit_time,
        loanAmount: parseFloat(data.loan_amount || '0'),
        serviceFee: parseFloat(data.service_fee || '0'),
        ownerId: data.owner_id,
        ownerName: data.owner_name,
      },
    });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 删除客户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const adminRole = request.headers.get('x-admin-role');
    const { id } = await params;

    if (!adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const client = getSupabaseClient();

    // 先查询客户检查权限
    const { data: existing, error: queryError } = await client
      .from('customers')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();

    if (queryError || !existing) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 });
    }

    // 权限检查
    if (adminRole !== 'super_admin' && existing.owner_id !== adminId) {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const { error } = await client
      .from('customers')
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
