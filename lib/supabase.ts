import { createClient } from '@supabase/supabase-js'

// 🚨 暴力測試：直接寫死，不依賴 process.env
const supabaseUrl = 'https://qwpqaxtnvfjvzmlgncss.supabase.co';
const supabaseAnonKey = 'sb_publishable_eUProS6rrxBPBUgCrtbqVg_mPd-chrg'; // ⚠️ 請將這裡替換成你剛剛 Rotate 過後，最新拿到的那串完整 anon key！

export const supabase = createClient(supabaseUrl, supabaseAnonKey)