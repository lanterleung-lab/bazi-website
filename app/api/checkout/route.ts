// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 初始化 Stripe (它會自動讀取你 .env.local 裡的 STRIPE_SECRET_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, serviceName, masterName } = body;

    // 建立 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay'], // 允許信用卡與支付寶
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: `預約保留金：${masterName} - ${serviceName}`,
            },
            unit_amount: amount * 100, // 港幣轉換為仙 (乘100)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // 付款成功後，跳轉回你的網站首頁，並在網址帶上 session_id
      success_url: `${request.headers.get('origin')}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      // 取消付款跳回首頁
      cancel_url: `${request.headers.get('origin')}/?checkout=canceled`,
      metadata: {
        orderId: orderId, // 將 Supabase 的訂單 ID 藏在 metadata 裡
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}