'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { KeyRound, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 呼叫 Supabase Auth 進行帳號密碼驗證
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 登入成功，核發通行證並放行進入專屬後台
      router.push('/dashboard/master');
    } catch (error: any) {
      console.error('登入失敗:', error);
      setErrorMsg('帳號或密碼錯誤，請重新輸入。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center font-sans p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100 w-full max-w-md">
        
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">大師入口</h1>
          <p className="text-stone-500 text-sm">請輸入平台配發的專屬帳號與密碼</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-700" /> 專屬信箱
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
              placeholder="master@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-700" /> 登入密碼
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 transition-all font-medium flex justify-center items-center gap-2 shadow-lg mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '安全登入'}
          </button>
        </form>
        
      </div>
    </div>
  );
}