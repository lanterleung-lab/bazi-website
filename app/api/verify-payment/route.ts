import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// 初始化 Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// 初始化 Supabase (使用 Service Role Key 以繞過 RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''; 
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // 1. 去 Stripe 查詢這個 session_id 的真實狀態
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // 2. 確認是否真的付款成功
    if (session.payment_status === 'paid') {
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        return NextResponse.json({ error: '找不到訂單 ID' }, { status: 400 });
      }

      // 3. 更新 Supabase 訂單狀態為 confirmed
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);

      if (updateError) {
        throw new Error(`更新資料庫失敗: ${updateError.message}`);
      }

      return NextResponse.json({ success: true, message: '訂單狀態已更新為 confirmed' });
    } else {
       return NextResponse.json({ success: false, message: '付款尚未完成' });
    }

  } catch (err: any) {
    console.error('Verify Payment Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}