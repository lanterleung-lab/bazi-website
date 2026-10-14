'use client';

import React, { useState, useEffect } from 'react';
import MasterShowcase from './components/MasterShowcase';
import BaziCalculator from './components/BaziCalculator';
import { Star, Quote, Compass, Sparkles, Heart, Briefcase, MapIcon, Sun, Moon, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'guidance' | 'tools'>('guidance');
  const [activeTool, setActiveTool] = useState<'bazi' | 'tarot' | 'numerology'>('bazi');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('ALL');

  const [isDrawingTarot, setIsDrawingTarot] = useState(false);
  const [drawnCard, setDrawnCard] = useState<any>(null);

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

  // 🌟 升級版：加上代理服務完美解決防盜鏈的塔羅牌庫
  const TAROT_DECK = [
    { 
      name: '愚者 (The Fool)', 
      image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/en/9/90/RWS_Tarot_00_Fool.jpg',
      quote: '「每一次勇敢的躍下，都是學會飛翔的開始。」',
      meaning: '這是一張代表無限可能性與全新開始的牌。今天非常適合大膽跳出舒適圈，不要被過去的經驗綁架，請相信你最初的直覺。',
      love: '暗示一段輕鬆無負擔的新關係即將展開，或是現有關係中會出現令人驚喜的新火花。',
      career: '事業上適合嘗試全新的領域或跳脫常規的提案，不要害怕未知的挑戰。'
    },
    { 
      name: '魔術師 (The Magician)', 
      image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/en/d/de/RWS_Tarot_01_Magician.jpg',
      quote: '「你已經具備了創造奇蹟的所有元素。」',
      meaning: '宇宙正在為你敞開大門。你擁有足夠的資源、智慧與行動力，現在是化夢想為現實的最佳時機，請主動出擊。',
      love: '你的個人魅力正處於高峰，善用溝通技巧能輕易拉近彼此的距離。',
      career: '絕佳的表現機會！你的專業能力將被看見，適合談判、簽約或啟動新專案。'
    },
    { 
      name: '女祭司 (The High Priestess)', 
      image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/en/8/88/RWS_Tarot_02_High_Priestess.jpg',
      quote: '「向外看的人在做夢，向內看的人終將覺醒。」',
      meaning: '這是一個向內尋求答案的時刻。比起向外盲目行動，現在更需要靜下心來，傾聽潛意識的聲音，它會為你指明正確的方向。',
      love: '感情中需要更多的精神交流。比起言語，請試著用心去感受對方的弦外之音。',
      career: '適合進修、研究或從事策劃工作。遇到決策時，相信你的「第六感」。'
    },
    { 
      name: '命運之輪 (Wheel of Fortune)', 
      image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/en/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
      quote: '「萬物皆有定時，順應生命之流。」',
      meaning: '命運的齒輪正在轉動，這預示著一個無法預期但必然發生的轉機。無論現在是低谷還是高峰，一切都在朝著更好的方向演進。',
      love: '可能會出現命中注定的相遇，或是關係迎來一個自然而然的重要轉折點。',
      career: '大環境的變化將為你帶來意想不到的好運，請保持彈性，順勢而為。'
    },
    { 
      name: '星星 (The Star)', 
      image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/en/c/cd/RWS_Tarot_17_Star.jpg',
      quote: '「在最深的黑夜裡，星星的光芒最為璀璨。」',
      meaning: '在經歷了黑暗與混亂之後，星星為你帶來了療癒、平靜與希望。你的身心正在恢復平衡，靈感也將源源不絕。',
      love: '關係將回歸寧靜與純粹，誤會得以冰釋。單身者有望遇到精神契合的對象。',
      career: '充滿創意的時期，你的才華將如星光般閃耀，適合藝術、療癒或遠景規劃的工作。'
    },
    { 
      name: '太陽 (The Sun)', 
      image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/en/1/17/RWS_Tarot_19_Sun.jpg',
      quote: '「讓光芒灑滿每一個角落，所有的陰霾都將散去。」',
      meaning: '這是一張充滿活力、光明與極度正向的牌！所有的困難都已成為過去，接下來迎接你的將是成功、喜悅與豐盛。',
      love: '感情關係明朗且充滿熱情，彼此坦誠相待。是非常適合孕育新生命或步入婚姻的時刻。',
      career: '無往不利！你的努力將獲得豐碩的成果與眾人的肯定，盡情展現你的光芒吧。'
    },
  ];

  const handleDrawTarot = () => {
    setIsDrawingTarot(true);
    setDrawnCard(null);
    setTimeout(() => {
      const randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
      setDrawnCard(randomCard);
      setIsDrawingTarot(false);
    }, 1800);
  };

  // 🌟 升級版：多維度生命靈數解讀
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

  const LIFE_PATH_DESC: Record<number, { title: string, traits: string, love: string, career: string }> = {
    1: { title: '創始數', traits: '天生的領導者，充滿自信與獨立精神。你擁有強大的意志力，不喜歡被世俗規則束縛，總是渴望開創屬於自己的道路。', love: '在關係中習慣佔據主導權。你需要一位能給予你足夠自由，同時又能並肩作戰的伴侶。', career: '極度適合創業、自由工作者或擔任團隊的管理職。創新與挑戰是你動力的來源。' },
    2: { title: '協調數', traits: '你是天生的和平使者，溫和、體貼且極具同理心。你非常善於察言觀色，是團隊中最棒的調停者與支持者。', love: '極度重視伴侶關係，渴望深刻的情感連結與陪伴。有時容易為了迎合對方而委屈自己。', career: '適合公關、人資、諮商輔導等需要高度溝通與協調的工作。' },
    3: { title: '表達數', traits: '充滿活力與創意的樂天派！你天生具有藝術感與強大的表達天賦，總能輕易成為人群中的開心果。', love: '喜歡輕鬆愉快、充滿新鮮感的戀愛。對於太過沉重或束縛的關係容易感到窒息。', career: '演藝、設計、文字工作或任何能展現個人創意的舞台，都是你的天下。' },
    4: { title: '穩定數', traits: '務實、可靠、有紀律。你就像是一座堅固的堡壘，重視秩序與安全感，是所有人眼中最值得信賴的基石。', love: '對待感情認真且專一，渴望建立穩定且長久的家庭。偶爾可以試著給伴侶一點小浪漫。', career: '適合財務、工程、行政等需要嚴謹邏輯與架構規劃的專業領域。' },
    5: { title: '自由數', traits: '熱愛自由、熱心冒險！你擁有極強的適應力與好奇心，喜歡體驗生活中的各種變化，討厭一成不變的日子。', love: '愛情對你來說是一場刺激的探險。伴侶必須能跟上你的節奏，並給你足夠的個人空間。', career: '旅遊、業務、媒體等需要頻繁走動與接觸新事物的工作最適合你。' },
    6: { title: '奉獻數', traits: '充滿母性/父性光輝的照顧者。你極度重視家庭與和諧，富有同情心，總是將他人的需求放在自己之前。', love: '在感情中是個完美的照顧者，但也容易因為付出太多而失去自我。請記得也要好好愛自己。', career: '醫療、教育、服務業或任何與「療癒」、「照顧」相關的產業。' },
    7: { title: '真理數', traits: '你是理性的思想家與探求者。善於分析，擁有敏銳的洞察力，喜歡獨處並探索事物背後的深層真相與哲理。', love: '對於伴侶有著極高的精神契合度要求。你需要的是靈魂伴侶，而非世俗的柴米油鹽。', career: '適合研究員、分析師、學者或玄學/神祕學領域的探索。' },
    8: { title: '權威數', traits: '具備強大的商業頭腦與執行力。你對於世俗的成功、財富與權力有著強烈的渴望，並且有能力將其實現。', love: '在感情中也帶有幾分霸總氣息。你願意為伴侶提供豐厚的物質基礎，但也渴望絕對的忠誠。', career: '企業家、金融投資、高階主管。你是天生做大事的人。' },
    9: { title: '大愛數', traits: '擁有老靈魂的智者。你充滿人道主義精神，富有同情心，具有寬闊的視野與無私的大愛。', love: '感情觀極具包容力，但也容易因為過度理想化而對現實中的伴侶感到失望。', career: '公益事業、跨國交流、藝術創作或任何能為全人類帶來啟發的工作。' },
    11: { title: '靈感大師數', traits: '直覺極強，充滿靈性，能輕易感知他人的情緒與能量。你是能啟發他人的心靈導師。', love: '極度敏感，需要一位能完全包容你情緒起伏與精神世界的伴侶。', career: '心理諮商、身心靈療癒、藝術家、精神領袖。' },
    22: { title: '建設大師數', traits: '擁有將偉大夢想化為現實的強大力量。你結合了4號的務實與11號的靈感，是大師級的建造者。', love: '需要一位能與你共同築夢、腳踏實地的靈魂伴侶。', career: '建築、大型專案管理、政治家、改變社會結構的推動者。' },
    33: { title: '奉獻大師數', traits: '極度稀有的純粹能量。你充滿無私的愛與治癒力，猶如人間的菩薩，願意為成就大愛而犧牲自我。', love: '你的愛超越了個人的情愛，伴侶必須能理解並支持你的宏大願景。', career: '慈善家、精神導師、拯救者角色的極致展現。' }
  };

  const guidanceTopics = [
    { id: 'love', icon: <Heart className="w-8 h-8 mb-4 text-rose-400 group-hover:scale-110 transition-transform" />, title: '感情姻緣', desc: '尋找正緣、情感解惑、關係修復', keyword: '感情' },
    { id: 'career', icon: <Briefcase className="w-8 h-8 mb-4 text-blue-400 group-hover:scale-110 transition-transform" />, title: '事業財運', desc: '轉職抉擇、天賦探索、財富指引', keyword: '事業' },
    { id: 'life', icon: <MapIcon className="w-8 h-8 mb-4 text-emerald-400 group-hover:scale-110 transition-transform" />, title: '人生迷惘', desc: '流年運勢、人生藍圖、重大抉擇', keyword: '迷惘' },
    { id: 'healing', icon: <Sun className="w-8 h-8 mb-4 text-amber-400 group-hover:scale-110 transition-transform" />, title: '內在療癒', desc: '潛意識探索、OH卡、心理諮詢', keyword: '療癒' },
  ];

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-emerald-500 selection:text-stone-950 overflow-hidden relative">
      
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

                {activeTool === 'bazi' && (
                  <div className="animate-in zoom-in-95 duration-300">
                    <BaziCalculator onActionClick={() => handleGuidanceClick('八字')} actionText="尋找八字大師詳批" />
                  </div>
                )}

                {/* 🌟 升級版：塔羅渲染區 */}
                {activeTool === 'tarot' && (
                  <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm animate-in zoom-in-95 duration-300 relative overflow-hidden">
                    <Moon className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif text-stone-100 mb-2">塔羅潛意識指引</h3>
                    <p className="text-stone-400 mb-8 max-w-md mx-auto text-sm">深呼吸，在心中默念你近期的困惑，然後憑直覺點擊一張牌。</p>
                    
                    {!drawnCard ? (
                      <div className="flex justify-center gap-4 md:gap-8 mb-8">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            onClick={isDrawingTarot ? undefined : handleDrawTarot}
                            className={`w-24 h-36 md:w-32 md:h-48 bg-stone-800 border-2 border-stone-600 rounded-xl shadow-lg flex items-center justify-center cursor-pointer transition-all duration-500 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] ${isDrawingTarot ? 'animate-pulse scale-95 border-indigo-500' : 'hover:-translate-y-4 hover:shadow-indigo-500/30 hover:border-indigo-400'}`}
                          >
                            <Star className={`w-8 h-8 text-stone-600 ${isDrawingTarot ? 'animate-spin text-indigo-400' : ''}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex flex-col md:flex-row gap-8 items-start bg-stone-800/50 border border-indigo-500/20 rounded-3xl p-6 md:p-8 text-left">
                          
                          {/* 左側：真實牌圖 */}
                          <div className="w-full md:w-1/3 flex justify-center shrink-0">
                            <img src={drawnCard.image} alt={drawnCard.name} className="w-48 rounded-xl shadow-2xl shadow-indigo-900/30 border border-stone-700" />
                          </div>

                          {/* 右側：多維度解讀 */}
                          <div className="w-full md:w-2/3 space-y-5">
                            <div>
                              <div className="text-indigo-400 text-sm font-medium tracking-widest mb-1 uppercase">Today's Guidance</div>
                              <h4 className="text-3xl font-bold text-stone-100 mb-2">{drawnCard.name}</h4>
                              <p className="text-stone-400 italic text-sm border-l-2 border-indigo-500 pl-3 py-1">{drawnCard.quote}</p>
                            </div>
                            
                            <div className="space-y-3 pt-2">
                              <div>
                                <h5 className="text-stone-300 font-medium flex items-center gap-2 mb-1"><Sparkles className="w-4 h-4 text-indigo-400"/> 牌面啟示</h5>
                                <p className="text-stone-400 text-sm leading-relaxed">{drawnCard.meaning}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                                  <h5 className="text-rose-400 text-xs font-bold mb-1 flex items-center gap-1"><Heart className="w-3 h-3"/> 感情指引</h5>
                                  <p className="text-stone-400 text-xs leading-relaxed">{drawnCard.love}</p>
                                </div>
                                <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                                  <h5 className="text-blue-400 text-xs font-bold mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3"/> 事業指引</h5>
                                  <p className="text-stone-400 text-xs leading-relaxed">{drawnCard.career}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 溫和的引流按鈕 */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                          <button onClick={handleDrawTarot} className="px-6 py-3 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full transition-colors flex items-center justify-center gap-2 font-medium">
                            <RefreshCcw className="w-4 h-4" /> 重新抽牌
                          </button>
                          <button onClick={() => handleGuidanceClick('塔羅')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                            <Moon className="w-4 h-4" /> 需要更針對性的解答？尋找專屬塔羅師
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 🌟 升級版：靈數渲染區 */}
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

                    {lifePath && LIFE_PATH_DESC[lifePath] && (
                      <div className="max-w-2xl mx-auto bg-stone-800/50 border border-amber-500/20 rounded-3xl p-6 md:p-8 text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-6 mb-6 border-b border-stone-700/50 pb-6">
                          <div className="w-20 h-20 rounded-full bg-amber-900/30 border border-amber-500/30 flex items-center justify-center shrink-0">
                            <span className="text-4xl font-serif font-bold text-amber-400">{lifePath}</span>
                          </div>
                          <div>
                            <div className="text-amber-500 text-sm font-medium tracking-widest mb-1">YOUR LIFE PATH</div>
                            <h4 className="text-2xl font-bold text-stone-100">{LIFE_PATH_DESC[lifePath].title}</h4>
                          </div>
                        </div>

                        <div className="space-y-5 mb-8">
                          <div>
                            <h5 className="text-stone-200 font-medium flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-amber-400"/> 天賦特質</h5>
                            <p className="text-stone-400 text-sm leading-relaxed">{LIFE_PATH_DESC[lifePath].traits}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                              <h5 className="text-rose-400 text-xs font-bold mb-1 flex items-center gap-1"><Heart className="w-3 h-3"/> 感情模式</h5>
                              <p className="text-stone-400 text-xs leading-relaxed">{LIFE_PATH_DESC[lifePath].love}</p>
                            </div>
                            <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                              <h5 className="text-blue-400 text-xs font-bold mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3"/> 適合事業</h5>
                              <p className="text-stone-400 text-xs leading-relaxed">{LIFE_PATH_DESC[lifePath].career}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <button onClick={() => handleGuidanceClick('靈數')} className="px-8 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-full font-medium transition-all active:scale-95 flex items-center gap-2">
                            <Compass className="w-4 h-4" /> 探索流年運勢？尋找靈數專家解析
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

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