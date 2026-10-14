'use client';

import React, { useState, useEffect } from 'react';
import MasterShowcase from './components/MasterShowcase';
import BaziCalculator from './components/BaziCalculator';
import { Star, Quote, Compass, Sparkles, Heart, Briefcase, MapIcon, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase'; // 確保路徑正確指向你的 supabase 客戶端

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  // 記錄目前被點擊要放大的圖片網址
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 新增：控制首頁頂部要顯示「情境引導」還是「工具箱」
  const [activeTab, setActiveTab] = useState<'guidance' | 'tools'>('guidance');

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

  const guidanceTopics = [
    { id: 'love', icon: <Heart className="w-8 h-8 mb-4 text-rose-400 group-hover:scale-110 transition-transform" />, title: '感情姻緣', desc: '尋找正緣、情感解惑、關係修復' },
    { id: 'career', icon: <Briefcase className="w-8 h-8 mb-4 text-blue-400 group-hover:scale-110 transition-transform" />, title: '事業財運', desc: '轉職抉擇、天賦探索、財富指引' },
    { id: 'life', icon: <MapIcon className="w-8 h-8 mb-4 text-emerald-400 group-hover:scale-110 transition-transform" />, title: '人生迷惘', desc: '流年運勢、人生藍圖、重大抉擇' },
    { id: 'healing', icon: <Sun className="w-8 h-8 mb-4 text-amber-400 group-hover:scale-110 transition-transform" />, title: '內在療癒', desc: '潛意識探索、OH卡、心理諮詢' },
  ];

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-emerald-500 selection:text-stone-950 overflow-hidden relative">
      
      {/* 🌟 升級版背景：宇宙星象與神祕學幾何羅盤 */}
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] pointer-events-none opacity-[0.07] flex items-center justify-center z-0">
        <div className="w-full h-full text-stone-300" style={{ animation: 'spin 240s linear infinite' }}>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g transform="translate(50,50)">
              <circle r="49" fill="none" stroke="currentColor" strokeWidth="0.2" />
              <circle r="47" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 2" />
              <circle r="35" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.6"/>
              <circle r="20" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 3"/>
              <path d="M -49 0 L 49 0 M 0 -49 L 0 49" stroke="currentColor" strokeWidth="0.15" opacity="0.5"/>
              <path d="M -34.6 -34.6 L 34.6 34.6 M -34.6 34.6 L 34.6 -34.6" stroke="currentColor" strokeWidth="0.15" opacity="0.5"/>
              <path d="M -18.7 -45.3 L 18.7 45.3 M -18.7 45.3 L 18.7 -45.3" stroke="currentColor" strokeWidth="0.1" opacity="0.3"/>
              <path d="M -45.3 -18.7 L 45.3 18.7 M -45.3 18.7 L 45.3 -18.7" stroke="currentColor" strokeWidth="0.1" opacity="0.3"/>
              <circle cx="0" cy="-35" r="1.5" fill="currentColor" opacity="0.8" />
              <circle cx="35" cy="0" r="1.5" fill="currentColor" opacity="0.8" />
              <circle cx="0" cy="35" r="1.5" fill="currentColor" opacity="0.8" />
              <circle cx="-35" cy="0" r="1.5" fill="currentColor" opacity="0.8" />
              <circle cx="24.7" cy="-24.7" r="1" fill="currentColor" opacity="0.5" />
              <circle cx="-24.7" cy="24.7" r="1" fill="currentColor" opacity="0.5" />
            </g>
          </svg>
        </div>
      </div>
      
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-0"></div>

      {/* 🌟 核心互動區：文案、引導與工具箱切換 */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 z-10 border-b border-stone-900 min-h-[85vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-serif text-stone-100 mb-6 tracking-wide drop-shadow-sm">
              遇見你的心靈指引
            </h1>
            <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              匯聚東方命理、西方塔羅與現代心理學。<br className="hidden md:block" />在迷惘的十字路口，為您點亮前行的方向。
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button 
              onClick={() => setActiveTab('guidance')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'guidance' 
                ? 'bg-stone-100 text-stone-900 shadow-lg shadow-stone-100/10' 
                : 'bg-stone-900/50 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Compass className="w-4 h-4" /> 我需要方向
            </button>
            <button 
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'tools' 
                ? 'bg-stone-100 text-stone-900 shadow-lg shadow-stone-100/10' 
                : 'bg-stone-900/50 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Sparkles className="w-4 h-4" /> 探索工具箱
            </button>
          </div>

          <div className="max-w-5xl mx-auto transition-all duration-500">
            {activeTab === 'guidance' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {guidanceTopics.map((topic) => (
                  <div 
                    key={topic.id}
                    onClick={scrollToMasters}
                    className="group bg-stone-900/40 hover:bg-stone-800/80 border border-stone-800 hover:border-stone-600 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex justify-center">{topic.icon}</div>
                    <h3 className="text-xl font-bold text-stone-200 mb-3">{topic.title}</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">{topic.desc}</p>
                    <div className="mt-6 text-xs font-medium text-stone-400 group-hover:text-stone-200 transition-colors flex items-center justify-center gap-1">
                      尋找適合的大師 <Compass className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 max-w-3xl mx-auto">
                <BaziCalculator 
                  onActionClick={scrollToMasters} 
                  actionText="尋找大師深度解析" 
                />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 🌟 數據統計：文案已通用化 */}
      <section className="py-12 border-b border-stone-800/50 bg-stone-900/40 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-stone-800/80">
          <div>
            <div className="text-3xl font-bold text-emerald-400 font-serif mb-1">10k+</div>
            <div className="text-sm text-stone-500">累積諮詢人次</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400 font-serif mb-1">98%</div>
            <div className="text-sm text-stone-500">客戶好評率</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400 font-serif mb-1">10+</div>
            <div className="text-sm text-stone-500">年專業諮詢經驗</div>
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
            <p className="text-stone-400">在迷惘中找到方向的真實聲音</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
           {reviews.map((review) => (
              <div key={review.id} className="bg-stone-900/60 p-6 md:p-8 rounded-3xl border border-stone-800 relative hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-sm flex flex-col group overflow-hidden">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-stone-800/50 z-0" />
                
                <div className="flex gap-1 mb-5 relative z-10">
                  {[...Array(review.rating || 5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-emerald-500 text-emerald-500" />)}
                </div>

                {review.image_url && (
                  <div 
                    onClick={() => setSelectedImage(review.image_url)}
                    className="w-full relative mb-6 rounded-xl overflow-hidden border border-stone-700/50 shadow-lg bg-stone-800 cursor-zoom-in"
                  >
                    <img 
                      src={review.image_url} 
                      alt={`Review by ${review.client_name}`} 
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ maxHeight: '350px', objectPosition: 'top' }}
                    />
                  </div>
                )}

                {(!review.image_url || (review.content && review.content !== '見截圖對話')) && (
                  <p className="text-stone-300 leading-relaxed mb-6 flex-grow relative z-10">
                    "{review.content}"
                  </p>
                )}

                <div className="font-medium text-emerald-400 text-sm mt-auto relative z-10 pt-5 border-t border-stone-800/50">
                  — {review.client_name} {review.role && <span className="text-stone-500">({review.role})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 點擊放大的全螢幕燈箱 (Lightbox) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center">
            <img 
              src={selectedImage} 
              alt="Enlarged review" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="absolute -bottom-8 text-stone-400 text-sm">點擊任意空白處關閉</p>
          </div>
        </div>
      )}
      
    </main>
  );
}