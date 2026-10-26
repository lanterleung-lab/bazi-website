// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  console.log('--- 進入 Checkout API ---');
  
  try {
    // 💡 初始化 Stripe (使用你修改後的環境變數名稱，並且完全移除 apiVersion)
    const stripeSecretKey = process.env.STRIPE_S_KEY;
    console.log('1. 讀取密鑰:', stripeSecretKey ? '成功讀取' : '未讀取到 (undefined)');

    if (!stripeSecretKey) {
      throw new Error('無法從環境變數讀取 STRIPE_S_KEY');
    }

    const stripe = new Stripe(stripeSecretKey);
    console.log('2. Stripe 初始化成功');

    const body = await request.json();
    console.log('3. 收到前端資料:', body);
    
    const { orderId, amount, serviceName, masterName } = body;

    // 💡 防護機制：抓取網址來源，如果抓不到就組裝一個
    const origin = request.headers.get('origin') || 'https://' + request.headers.get('host');
    console.log('4. 網址來源 origin:', origin);

    // 建立 Stripe Checkout Session
    console.log('5. 準備呼叫 Stripe API...');
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: `預約保留金：${masterName || '導師'} - ${serviceName || '諮詢服務'}`,
            },
            unit_amount: Math.round((amount || 100) * 100), 
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

    console.log('6. Stripe Session 建立成功, URL:', session.url);
    return NextResponse.json({ url: session.url });
    
  } catch (err: any) {
    console.error('❌ Checkout API 發生嚴重錯誤:', err.message);
    // 確保一定回傳 JSON 格式的錯誤，這樣前端 JSON 解析才不會崩潰
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}