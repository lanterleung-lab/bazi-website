'use client';

import React, { useState, useEffect } from 'react';
import MasterShowcase from './components/MasterShowcase';
import BaziCalculator from './components/BaziCalculator';
import { Star, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase'; // 確保路徑正確指向你的 supabase 客戶端

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);

  // 網頁載入時，從 Supabase 抓取最新的 3 筆評價
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (!error && data) {
        setReviews(data);
      }
    };
    fetchReviews();
  }, []);

  const scrollToMasters = () => {
    document.getElementById('masters-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-emerald-500 selection:text-stone-950 overflow-hidden relative">
      
      {/* 全局大背景：太極與星象光暈裝飾 */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] pointer-events-none opacity-[0.08] flex items-center justify-center z-0">
        <div className="w-full h-full text-stone-500" style={{ animation: 'spin 180s linear infinite' }}>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g transform="translate(50,50)">
              <circle r="49" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0 -49 A 49 49 0 0 1 0 49 A 24.5 24.5 0 0 0 0 0 A 24.5 24.5 0 0 1 0 -49" fill="currentColor" />
              <circle cx="0" cy="-24.5" r="6" fill="#0c0a09" />
              <circle cx="0" cy="24.5" r="6" fill="currentColor" />
            </g>
          </svg>
        </div>
      </div>
      
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-0"></div>

      <section className="relative pt-28 pb-20 px-4 md:px-8 z-10 border-b border-stone-900">
        <div className="max-w-7xl mx-auto">
          <BaziCalculator 
            onActionClick={scrollToMasters} 
            actionText="尋找大師深度解析" 
          />
        </div>
      </section>

      <section className="py-12 border-b border-stone-800/50 bg-stone-900/40 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-stone-800/80">
          <div>
            <div className="text-3xl font-bold text-emerald-400 font-serif mb-1">10k+</div>
            <div className="text-sm text-stone-500">累積排盤人次</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400 font-serif mb-1">98%</div>
            <div className="text-sm text-stone-500">客戶好評率</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400 font-serif mb-1">15+</div>
            <div className="text-sm text-stone-500">年實戰經驗</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400 font-serif mb-1 flex items-center justify-center gap-1">
              4.9 <Star className="w-5 h-5 fill-emerald-400 text-emerald-400" />
            </div>
            <div className="text-sm text-stone-500">綜合評分</div>
          </div>
        </div>
      </section>
      
      <div id="masters-section" className="bg-stone-50 text-stone-900 relative z-10">
        <MasterShowcase />
      </div>

      <section className="py-24 px-6 bg-stone-950 relative z-10 border-t border-stone-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-stone-100 mb-4">改變人生的指引</h2>
            <p className="text-stone-400">聽聽那些在迷惘中找到方向的真實聲音</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-stone-900/60 p-8 rounded-3xl border border-stone-800 relative hover:border-emerald-500/30 transition-colors backdrop-blur-sm flex flex-col h-full">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-stone-800" />
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-emerald-500 text-emerald-500" />)}
                </div>
                <p className="text-stone-300 leading-relaxed mb-6 flex-grow">"{review.content}"</p>
                <div className="font-medium text-emerald-400 text-sm">
                  — {review.client_name} {review.role && <span className="text-stone-500">({review.role})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </main>
  );
}