import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚨 強制印出變數內容，讓我們看看 Vercel 到底抓到了什麼
console.log("👉 Vercel 抓到的 URL:", supabaseUrl);
console.log("👉 Vercel 抓到的 KEY (前 10 碼):", supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + "..." : "空值 (undefined)");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ 嚴重錯誤：Supabase 網址或 Anon Key 未能成功載入！");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)