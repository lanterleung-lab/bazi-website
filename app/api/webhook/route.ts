import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase'; 

// 💡 修正 1：拔掉 apiVersion，讓 Stripe SDK 自己決定當前版本
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  
  // 💡 修正 2：在 Next.js 最新版中，headers() 是非同步的，必須加上 await
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string 
    );
  } catch (err: any) {
    console.error(`Webhook 簽名驗證失敗: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        console.log(`收到付款成功通知！準備更新訂單 ID: ${orderId}`);
        
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'confirmed',
          })
          .eq('id', orderId);

        if (error) {
          console.error(`更新訂單狀態失敗 (ID: ${orderId}):`, error);
        } else {
          console.log(`訂單 ID: ${orderId} 狀態已成功更新為 confirmed`);
        }
      } catch (err) {
        console.error('Webhook 資料庫操作發生未預期錯誤:', err);
      }
    } else {
      console.warn('收到結帳成功通知，但找不到 metadata 中的 orderId。');
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}