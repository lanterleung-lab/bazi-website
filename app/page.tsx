'use client';

import MasterShowcase from './components/MasterShowcase';
import BaziCalculator from './components/BaziCalculator';

export default function Home() {
  const scrollToMasters = () => {
    document.getElementById('masters-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-emerald-500 selection:text-stone-950 overflow-hidden relative">
      
     {/* 🌟 全局大背景：太極與星象光暈裝飾 */}
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
      
      {/* 背景星塵質感 */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-0"></div>

      {/* 🌟 頂部英雄區塊 (Hero Section)：全版沉浸式黑金設計 */}
      <section className="relative pt-28 pb-20 px-4 md:px-8 z-10 border-b border-stone-900">
        <div className="max-w-7xl mx-auto">
          <BaziCalculator 
            onActionClick={scrollToMasters} 
            actionText="尋找大師深度解析" 
          />
        </div>
      </section>
      
      {/* 🌟 下方大師櫥窗展示區 (自動銜接簡潔的高級米白/淺灰過渡) */}
      <div id="masters-section" className="bg-stone-50 text-stone-900 relative z-10">
        <MasterShowcase />
      </div>
      
    </main>
  );
}