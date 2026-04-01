import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const adminRole = request.headers.get('x-admin-role');

    if (!adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const client = getSupabaseClient();

    // 构建查询
    let query = client.from('customers').select('status, loan_amount, service_fee, owner_id');
    
    // 非超级管理员只统计自己的客户
    if (adminRole !== 'super_admin') {
      query = query.eq('owner_id', adminId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    const customers = data || [];
    const total = customers.length;
    const byStatus = {
      need: customers.filter((c) => c.status === 'need').length,
      not_need: customers.filter((c) => c.status === 'not_need').length,
      following: customers.filter((c) => c.status === 'following').length,
      completed: customers.filter((c) => c.status === 'completed').length,
    };
    const totalLoanAmount = customers.reduce((sum, c) => sum + parseFloat(c.loan_amount || '0'), 0);
    const totalServiceFee = customers.reduce((sum, c) => sum + parseFloat(c.service_fee || '0'), 0);

    return NextResponse.json({
      total,
      byStatus,
      byOwner: {},
      totalLoanAmount,
      totalServiceFee,
    });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
