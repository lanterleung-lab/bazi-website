// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// 初始化具備管理員權限的 Supabase 後端客戶端 (繞過前端 RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const stripe = new Stripe(process.env.STRIPE_S_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { masterId, clientName, clientPhone, serviceName, totalPrice, deposit, balance, appointmentDate, appointmentTime, masterName } = body;

    // 1. 直接在後端安全地將訂單寫入 Supabase (絕對不會有 401 或 RLS 阻擋)
    const { data: orderData, error: dbError } = await supabaseAdmin.from('orders').insert([{
      master_id: masterId,
      client_name: clientName,
      client_phone: clientPhone,
      service_name: serviceName,
      total_price: totalPrice,
      deposit_paid: deposit,
      balance_due: balance,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'awaiting_payment'
    }]).select().single();

    if (dbError) {
      throw new Error(`資料庫寫入失敗: ${dbError.message}`);
    }

    const origin = request.headers.get('origin') || 'https://' + request.headers.get('host');

    // 2. 建立 Stripe 結帳 Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: `預約保留金：${masterName || '導師'} - ${serviceName || '諮詢服務'}`,
            },
            unit_amount: Math.round(deposit * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=canceled`,
      metadata: {
        orderId: String(orderData.id), 
      }
    });

    return NextResponse.json({ url: session.url });
    
  } catch (err: any) {
    console.error('Checkout API 發生錯誤:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}