// app/api/stripe-config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // 💡 在後端讀取你避開 Vercel 審查的名字 (例如 NEXT_STRIPE)
  // 如果你取別的名字，請把 NEXT_STRIPE 改成你在 Vercel 設定的那個
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY; 

  if (!publishableKey) {
    return NextResponse.json({ error: '找不到 Stripe 公鑰環境變數' }, { status: 500 });
  }

  return NextResponse.json({ publishableKey });
}