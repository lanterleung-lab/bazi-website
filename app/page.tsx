'use client';

import React, { useState, useEffect } from 'react';
import MasterShowcase from './components/MasterShowcase';
import BaziCalculator from './components/BaziCalculator';
import { Star, Quote, Compass, Sparkles, Heart, Briefcase, MapIcon, Sun, Moon, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 核心導航狀態
  const [activeTab, setActiveTab] = useState<'guidance' | 'tools'>('guidance');
  const [activeTool, setActiveTool] = useState<'bazi' | 'tarot' | 'numerology'>('bazi');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('ALL');

  // 塔羅牌狀態
  const [isDrawingTarot, setIsDrawingTarot] = useState(false);
  const [drawnCard, setDrawnCard] = useState<any>(null);

  // 生命靈數狀態
  const [birthDateStr, setBirthDateStr] = useState('');
  const [lifePath, setLifePath] = useState<number | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase.from('reviews').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3);
      if (!error && data) setReviews(data);
    };
    fetchReviews();
  }, []);

  const scrollToMasters = () => {
    document.getElementById('masters-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGuidanceClick = (keyword: string) => {
    setSelectedKeyword(keyword);
    setTimeout(() => {
      document.getElementById('masters-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // --- 塔羅牌資料與邏輯 ---
  const TAROT_DECK = [
    { name: '愚者 (The Fool)', keyword: '冒險', desc: '這是一張代表無限可能性與全新開始的牌。今天適合大膽跳出舒適圈，相信你的直覺。' },
    { name: '魔術師 (The Magician)', keyword: '創造', desc: '你已經具備了成功所需的所有資源。發揮你的溝通與創造力，化夢想為現實。' },
    { name: '女祭司 (The High Priestess)', keyword: '直覺', desc: '向內尋求答案的時刻。靜下心來，傾聽潛意識的聲音，它會為你指明方向。' },
    { name: '命運之輪 (Wheel of Fortune)', keyword: '轉機', desc: '命運的齒輪正在轉動，順應變化，迎接命中注定的機會與好運。' },
    { name: '星星 (The Star)', keyword: '希望', desc: '在黑暗中指引方向的星光。代表療癒、平靜、以及靈感與希望的湧現。' },
    { name: '太陽 (The Sun)', keyword: '喜悅', desc: '充滿活力與光明的一天！所有的陰霾都會散去，迎接成功與熱情的時刻。' },
  ];

  const handleDrawTarot = () => {
    setIsDrawingTarot(true);
    setDrawnCard(null);
    setTimeout(() => {
      const randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
      setDrawnCard(randomCard);
      setIsDrawingTarot(false);
    }, 1500);
  };

  // --- 生命靈數邏輯 ---
  const calculateLifePath = () => {
    if (!birthDateStr) return;
    const digits = birthDateStr.replace(/\D/g, '');
    if (digits.length !== 8) {
      alert('請輸入完整的 8 碼西元生日，例如 19900101');
      return;
    }
    let sum = digits.split('').reduce((acc, val) => acc + parseInt(val), 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, val) => acc + parseInt(val), 0);
    }
    setLifePath(sum);
  };

  const LIFE_PATH_DESC: Record<number, string> = {
    1: '創始數：天生的領導者，充滿自信與獨立精神，喜歡開創與創新。',
    2: '協調數：溫和、體貼，擅長傾聽與溝通，是團隊中最棒的調停者。',
    3: '表達數：充滿活力與創意，樂觀開朗，天生具有藝術與表達的天賦。',
    4: '穩定數：務實、可靠，重視秩序與安全感，是值得信賴的基石。',
    5: '自由數：熱愛自由與冒險，適應力強，喜歡體驗生活中的各種變化。',
    6: '奉獻數：充滿愛心與責任感，重視家庭與和諧，樂於照顧他人。',
    7: '真理數：理性、善於分析，喜歡探索事物背後的真相與哲理。',
    8: '權威數：具備強大的商業頭腦與執行力，追求世俗的成功與財富。',
    9: '大愛數：充滿人道主義精神，富有同情心，具有寬闊的視野與智慧。',
    11: '卓越數(靈感)：直覺極強，充滿靈性，能啟發他人的心靈導師。',
    22: '卓越數(建設)：擁有將偉大夢想化為現實的強大力量，是大師級的建造者。',
    33: '卓越數(奉獻)：充滿無私的愛與治癒能量，極度稀有的奉獻者。'
  };

  const guidanceTopics = [
    { id: 'love', icon: <Heart className="w-8 h-8 mb-4 text-rose-400 group-hover:scale-110 transition-transform" />, title: '感情姻緣', desc: '尋找正緣、情感解惑、關係修復', keyword: '感情' },
    { id: 'career', icon: <Briefcase className="w-8 h-8 mb-4 text-blue-400 group-hover:scale-110 transition-transform" />, title: '事業財運', desc: '轉職抉擇、天賦探索、財富指引', keyword: '事業' },
    { id: 'life', icon: <MapIcon className="w-8 h-8 mb-4 text-emerald-400 group-hover:scale-110 transition-transform" />, title: '人生迷惘', desc: '流年運勢、人生藍圖、重大抉擇', keyword: '迷惘' },
    { id: 'healing', icon: <Sun className="w-8 h-8 mb-4 text-amber-400 group-hover:scale-110 transition-transform" />, title: '內在療癒', desc: '潛意識探索、OH卡、心理諮詢', keyword: '療癒' },
  ];

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-emerald-500 selection:text-stone-950 overflow-hidden relative">
      
      {/* 背景裝飾 */}
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] pointer-events-none opacity-[0.07] flex items-center justify-center z-0">
        <div className="w-full h-full text-stone-300" style={{ animation: 'spin 240s linear infinite' }}>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g transform="translate(50,50)">
              <circle r="49" fill="none" stroke="currentColor" strokeWidth="0.2" />
              <circle r="47" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 2" />
              <circle r="35" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.6"/>
              <path d="M -49 0 L 49 0 M 0 -49 L 0 49" stroke="currentColor" strokeWidth="0.15" opacity="0.5"/>
              <circle cx="0" cy="-35" r="1.5" fill="currentColor" opacity="0.8" />
              <circle cx="35" cy="0" r="1.5" fill="currentColor" opacity="0.8" />
            </g>
          </svg>
        </div>
      </div>
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-0"></div>

      {/* 核心互動區 */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 z-10 border-b border-stone-900 min-h-[85vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-serif text-stone-100 mb-6 tracking-wide drop-shadow-sm">遇見你的心靈指引</h1>
            <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              匯聚東方命理、西方塔羅與現代心理學。<br className="hidden md:block" />在迷惘的十字路口，為您點亮前行的方向。
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button onClick={() => setActiveTab('guidance')} className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'guidance' ? 'bg-stone-100 text-stone-900' : 'bg-stone-900/50 text-stone-400 hover:text-stone-200 border border-stone-800'}`}>
              <Compass className="w-4 h-4" /> 我需要方向
            </button>
            <button onClick={() => setActiveTab('tools')} className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'tools' ? 'bg-stone-100 text-stone-900' : 'bg-stone-900/50 text-stone-400 hover:text-stone-200 border border-stone-800'}`}>
              <Sparkles className="w-4 h-4" /> 探索工具箱
            </button>
          </div>

          <div className="max-w-5xl mx-auto transition-all duration-500">
            {activeTab === 'guidance' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {guidanceTopics.map((topic) => (
                  <div key={topic.id} onClick={() => handleGuidanceClick(topic.keyword)} className="group bg-stone-900/40 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-500/50 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 backdrop-blur-sm shadow-xl hover:-translate-y-1">
                    <div className="flex justify-center">{topic.icon}</div>
                    <h3 className="text-xl font-bold text-stone-200 mb-3">{topic.title}</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">{topic.desc}</p>
                    <div className="mt-6 text-xs font-medium text-stone-400 group-hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">尋找相關大師 <Compass className="w-3 h-3" /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 max-w-4xl mx-auto">
                {/* 🌟 工具箱切換列 */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  <button onClick={() => setActiveTool('bazi')} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTool === 'bazi' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-stone-900/50 text-stone-500 border border-stone-800 hover:text-stone-300'}`}>
                    ☯️ 八字排盤
                  </button>
                  <button onClick={() => setActiveTool('tarot')} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTool === 'tarot' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-stone-900/50 text-stone-500 border border-stone-800 hover:text-stone-300'}`}>
                    🌙 每日塔羅
                  </button>
                  <button onClick={() => setActiveTool('numerology')} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTool === 'numerology' ? 'bg-amber-900/30 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'bg-stone-900/50 text-stone-500 border border-stone-800 hover:text-stone-300'}`}>
                    🔢 生命靈數
                  </button>
                </div>

                {/* 1. 八字排盤器 */}
                {activeTool === 'bazi' && (
                  <div className="animate-in zoom-in-95 duration-300">
                    <BaziCalculator onActionClick={() => handleGuidanceClick('八字')} actionText="尋找八字大師詳批" />
                  </div>
                )}

                {/* 2. 每日塔羅一抽 */}
                {activeTool === 'tarot' && (
                  <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm animate-in zoom-in-95 duration-300 relative overflow-hidden">
                    <Moon className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif text-stone-100 mb-2">塔羅潛意識指引</h3>
                    <p className="text-stone-400 mb-8 max-w-md mx-auto text-sm">深呼吸，在心中默念你近期的困惑，然後憑直覺點擊一張牌。</p>
                    
                    {!drawnCard ? (
                      <div className="flex justify-center gap-4 mb-8">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            onClick={isDrawingTarot ? undefined : handleDrawTarot}
                            className={`w-24 h-36 md:w-32 md:h-48 bg-stone-800 border border-stone-600 rounded-xl shadow-lg flex items-center justify-center cursor-pointer transition-all duration-500 ${isDrawingTarot ? 'animate-pulse scale-95 border-indigo-500' : 'hover:-translate-y-4 hover:shadow-indigo-500/30 hover:border-indigo-400'}`}
                          >
                            <Star className={`w-6 h-6 text-stone-600 ${isDrawingTarot ? 'animate-spin text-indigo-400' : ''}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto bg-stone-800/80 border border-indigo-500/30 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-indigo-400 text-sm font-medium mb-1">今日指引</div>
                        <h4 className="text-2xl font-bold text-stone-100 mb-3">{drawnCard.name}</h4>
                        <p className="text-stone-300 text-sm leading-relaxed mb-6">{drawnCard.desc}</p>
                        <div className="flex gap-3 justify-center">
                          <button onClick={handleDrawTarot} className="p-2 text-stone-400 hover:text-white bg-stone-700 hover:bg-stone-600 rounded-full transition-colors"><RefreshCcw className="w-4 h-4" /></button>
                          <button onClick={() => handleGuidanceClick('塔羅')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-all shadow-lg active:scale-95 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> 找塔羅師解牌
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. 生命靈數計算 */}
                {activeTool === 'numerology' && (
                  <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm animate-in zoom-in-95 duration-300">
                    <h3 className="text-2xl font-serif text-stone-100 mb-2">生命靈數計算</h3>
                    <p className="text-stone-400 mb-8 max-w-md mx-auto text-sm">輸入您的西元出生年月日，探索您靈魂的隱藏天賦與人生課題。</p>
                    
                    <div className="max-w-sm mx-auto space-y-4 mb-8">
                      <input 
                        type="text" 
                        placeholder="例如：19950520" 
                        value={birthDateStr}
                        onChange={(e) => setBirthDateStr(e.target.value)}
                        className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-center text-stone-100 text-lg tracking-widest focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        maxLength={8}
                      />
                      <button onClick={calculateLifePath} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all active:scale-95">
                        計算我的命運數
                      </button>
                    </div>

                    {lifePath && (
                      <div className="max-w-md mx-auto bg-stone-800/80 border border-amber-500/30 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-amber-500 font-medium mb-1">您的主命數是</div>
                        <h4 className="text-5xl font-serif font-bold text-stone-100 mb-4">{lifePath}</h4>
                        <p className="text-stone-300 text-sm leading-relaxed mb-6">{LIFE_PATH_DESC[lifePath] || '充滿神祕能量的獨特數字。'}</p>
                        <button onClick={() => handleGuidanceClick('靈數')} className="px-6 py-2.5 bg-stone-700 hover:bg-stone-600 text-white rounded-full font-medium transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto">
                          找靈數大師深入解析 <Compass className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 數據統計與評論區 */}
      <section className="py-12 border-b border-stone-800/50 bg-stone-900/40 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-stone-800/80">
          <div><div className="text-3xl font-bold text-emerald-400 font-serif mb-1">10k+</div><div className="text-sm text-stone-500">累積諮詢人次</div></div>
          <div><div className="text-3xl font-bold text-emerald-400 font-serif mb-1">98%</div><div className="text-sm text-stone-500">客戶好評率</div></div>
          <div><div className="text-3xl font-bold text-emerald-400 font-serif mb-1">10+</div><div className="text-sm text-stone-500">年專業諮詢經驗</div></div>
          <div><div className="text-3xl font-bold text-emerald-400 font-serif mb-1 flex items-center justify-center gap-1">4.9 <Star className="w-5 h-5 fill-emerald-400 text-emerald-400" /></div><div className="text-sm text-stone-500">綜合評分</div></div>
        </div>
      </section>
      
      <div id="masters-section" className="bg-stone-50 text-stone-900 relative z-10 scroll-mt-0">
        <MasterShowcase externalFilter={selectedKeyword} onClearFilter={() => setSelectedKeyword('ALL')} />
      </div>

      <section className="py-24 px-6 bg-stone-950 relative z-10 border-t border-stone-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-stone-100 mb-4">改變人生的指引</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {reviews.map((review) => (
              <div key={review.id} className="bg-stone-900/60 p-6 md:p-8 rounded-3xl border border-stone-800 relative hover:border-emerald-500/30 transition-all duration-300">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-stone-800/50 z-0" />
                <div className="flex gap-1 mb-5 relative z-10">
                  {[...Array(review.rating || 5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-emerald-500 text-emerald-500" />)}
                </div>
                {review.image_url && (
                  <div onClick={() => setSelectedImage(review.image_url)} className="w-full relative mb-6 rounded-xl overflow-hidden border border-stone-700/50 cursor-zoom-in">
                    <img src={review.image_url} alt="Review" className="w-full object-cover" style={{ maxHeight: '350px', objectPosition: 'top' }} />
                  </div>
                )}
                {(!review.image_url || (review.content && review.content !== '見截圖對話')) && (
                  <p className="text-stone-300 leading-relaxed mb-6 flex-grow relative z-10">"{review.content}"</p>
                )}
                <div className="font-medium text-emerald-400 text-sm mt-auto relative z-10 pt-5 border-t border-stone-800/50">
                  — {review.client_name} {review.role && <span className="text-stone-500">({review.role})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center">
            <img src={selectedImage} alt="Enlarged" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </main>
  );
}