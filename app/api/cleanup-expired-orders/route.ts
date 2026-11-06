import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase (必須使用 Service Role Key，因為這是背景任務，不受 RLS 限制)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''; 
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // 基礎安全驗證：確保這個 API 是由 Vercel Cron 觸發，而不是被路人亂打
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. 計算 15 分鐘前的時間點 (ISO 格式)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // 2. 去資料庫找出狀態為 awaiting_payment 且建立時間早於 fifteenMinutesAgo 的訂單
    const { data: expiredOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('status', 'awaiting_payment')
      .lt('created_at', fifteenMinutesAgo);

    if (fetchError) {
      throw new Error(`查詢過期訂單失敗: ${fetchError.message}`);
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      return NextResponse.json({ message: '沒有需要清理的過期訂單。' }, { status: 200 });
    }

    // 3. 取出所有過期訂單的 ID
    const expiredOrderIds = expiredOrders.map(order => order.id);

    // 4. 將這些訂單的狀態更新為 'cancelled'
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled' })
      .in('id', expiredOrderIds);

    if (updateError) {
      throw new Error(`更新訂單狀態失敗: ${updateError.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `成功清理 ${expiredOrderIds.length} 筆過期訂單。`,
      cancelledIds: expiredOrderIds
    }, { status: 200 });

  } catch (err: any) {
    console.error('清理過期訂單發生錯誤:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}