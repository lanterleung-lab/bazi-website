import { createClient } from '@supabase/supabase-js'

// 🚨 暴力測試：直接寫死，不依賴 process.env
const supabaseUrl = 'https://qwpqaxtnvfjvzmlgncss.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3cHFheHRudmZqdnptbGduY3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MTIyNjgsImV4cCI6MjEwMTM4ODI2OH0.UBZoUyGVbpmR04r5k5mCTA9Vno1rwGU80SgiodJhkVo'; // ⚠️ 請將這裡替換成你剛剛 Rotate 過後，最新拿到的那串完整 anon key！

export const supabase = createClient(supabaseUrl, supabaseAnonKey)