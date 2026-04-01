import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');

    if (!adminId) {
      return NextResponse.json({ admin: null });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('admins')
      .select('id, username, name, role, created_at, last_login')
      .eq('id', adminId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ admin: null });
    }

    if (!data) {
      return NextResponse.json({ admin: null });
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
    return NextResponse.json({ admin: null });
  }
}
