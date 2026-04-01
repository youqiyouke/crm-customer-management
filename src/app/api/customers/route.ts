import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取客户列表
export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const adminRole = request.headers.get('x-admin-role');

    if (!adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortField = searchParams.get('sortField') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const client = getSupabaseClient();
    let query = client
      .from('customers')
      .select('*');

    // 非超级管理员只能看自己的客户
    if (adminRole !== 'super_admin') {
      query = query.eq('created_by', adminId);
    }

    // 搜索
    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%`);
    }

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 排序
    const ascending = sortOrder === 'asc';
    query = query.order(sortField, { ascending });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    // 转换字段名
    const customers = (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      company: item.company,
      status: item.status,
      tags: item.tags ? item.tags.split(',').filter(Boolean) : [],
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      visitTime: item.visit_time,
      loanAmount: parseFloat(item.loan_amount || '0'),
      serviceFee: parseFloat(item.service_fee || '0'),
      ownerId: item.owner_id,
      ownerName: item.owner_name,
    }));

    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建客户
export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');

    if (!adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, company, status, tags, notes, loanAmount, serviceFee, ownerId, ownerName } = body;

    if (!name) {
      return NextResponse.json({ error: '姓名不能为空' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await client
      .from('customers')
      .insert({
        name,
        phone: phone || '',
        company: company || '',
        status: status || 'need',
        tags: tags ? tags.join(',') : '',
        notes: notes || '',
        created_by: adminId,
        owner_id: ownerId || adminId,
        owner_name: ownerName || '',
        created_at: now,
        updated_at: now,
        visit_time: now,
        loan_amount: (loanAmount || 0).toString(),
        service_fee: (serviceFee || 0).toString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
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
