// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 新的寫法：拔掉 apiVersion，讓套件自己決定
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 💡 這裡對齊前端傳過來的變數名稱 deposit
    const { orderId, deposit, serviceName, masterName } = body;

    // 💡 防護機制：抓取網址來源，如果抓不到就組裝一個
    const origin = request.headers.get('origin') || 'https://' + request.headers.get('host');

    // 建立 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              // 💡 整理一下字串格式，讓它在 Stripe 結帳畫面上更好看
              name: `預約保留金：${masterName || '導師'} - ${serviceName || '諮詢服務'}`,
            },
            // 💡 防護機制：確保金額絕對是整數。這裡使用 deposit
            unit_amount: Math.round((deposit || 100) * 100), 
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
        orderId: String(orderId || 'unknown'), // 將 Supabase 的訂單 ID 藏在 metadata 裡
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}