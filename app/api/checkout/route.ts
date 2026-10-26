// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 💡 初始化 Stripe (使用你修改後的環境變數名稱，並且完全移除 apiVersion)
const stripe = new Stripe(process.env.STRIPE_S_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, serviceName, masterName } = body;

    // 💡 防護機制：抓取網址來源，如果抓不到就組裝一個
    const origin = request.headers.get('origin') || 'https://' + request.headers.get('host');

    // 建立 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      // 🌟 已經移除 payment_method_types，改由 Stripe 儀表板自動控制
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              // 💡 修正了多行字串，確保這是一行
              name: `預約保留金：${masterName} - ${serviceName}`,
            },
            // 💡 防護機制：確保金額絕對是整數
            unit_amount: Math.round(amount * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // 付款成功後，跳轉回你的網站首頁，並在網址帶上 session_id
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      // 取消付款跳回首頁
      cancel_url: `${origin}/?checkout=canceled`,
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