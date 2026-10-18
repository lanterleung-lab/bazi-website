'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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

  // 🌟 完整 22 張大阿爾克那牌庫 (PNG 本地圖片版)
  const TAROT_DECK = [
    { name: '0. 愚者 (The Fool)', image: '/tarot/0.png', quote: '「每一次勇敢的躍下，都是學會飛翔的開始。」', meaning: '這是一張代表無限可能性與全新開始的牌。今天非常適合大膽跳出舒適圈，不要被過去的經驗綁架，請相信你最初的直覺。', love: '暗示一段輕鬆無負擔的新關係即將展開，或是現有關係中會出現令人驚喜的新火花。', career: '事業上適合嘗試全新的領域或跳脫常規的提案，不要害怕未知的挑戰。' },
    { name: 'I. 魔術師 (The Magician)', image: '/tarot/1.png', quote: '「你已經具備了創造奇蹟的所有元素。」', meaning: '宇宙正在為你敞開大門。你擁有足夠的資源、智慧與行動力，現在是化夢想為現實的最佳時機，請主動出擊。', love: '你的個人魅力正處於高峰，善用溝通技巧能輕易拉近彼此的距離。', career: '絕佳的表現機會！你的專業能力將被看見，適合談判、簽約或啟動新專案。' },
    { name: 'II. 女祭司 (The High Priestess)', image: '/tarot/2.png', quote: '「向外看的人在做夢，向內看的人終將覺醒。」', meaning: '這是一個向內尋求答案的時刻。比起向外盲目行動，現在更需要靜下心來，傾聽潛意識的聲音，它會為你指明正確的方向。', love: '感情中需要更多的精神交流。比起言語，請試著用心去感受對方的弦外之音。', career: '適合進修、研究或從事策劃工作。遇到決策時，相信你的「第六感」。' },
    { name: 'III. 皇后 (The Empress)', image: '/tarot/3.png', quote: '「愛與豐盛，正在你的生命中溫柔綻放。」', meaning: '代表豐饒、孕育與無條件的愛。今天是個適合善待自己與他人的日子，放慢腳步，去感受生活中的美好與豐盛。', love: '感情甜蜜且充滿包容，是非常適合孕育新生命或讓關係更進一步的時刻。', career: '創意湧現，能獲得豐富的資源支持。適合發展藝術、設計或與女性相關的產業。' },
    { name: 'IV. 皇帝 (The Emperor)', image: '/tarot/4.png', quote: '「建立秩序，掌握你人生的主導權。」', meaning: '代表穩定、權威與結構。現在需要你展現自律與責任感，用理性的頭腦去組織混亂的局面，建立長遠的根基。', love: '關係穩固且充滿安全感，雖然稍顯缺乏浪漫，但卻是能互相扶持的堅實後盾。', career: '展現領導力的時刻！適合創業、制定長遠計畫或接手管理職務。' },
    { name: 'V. 教皇 (The Hierophant)', image: '/tarot/5.png', quote: '「尋求智慧的指引，回歸精神的信仰。」', meaning: '代表傳統、學習與心靈導師。在迷惘時，不妨尋求長輩、專業人士的建議，或是從傳統智慧與書本中尋找解答。', love: '走向傳統穩定的關係（如論及婚嫁），或是雙方在精神價值觀上達到高度契合。', career: '適合進修、考取證照，或在體制內穩健發展，跟隨前輩的腳步能避開風險。' },
    { name: 'VI. 戀人 (The Lovers)', image: '/tarot/6.png', quote: '「傾聽內心的聲音，做出靈魂的選擇。」', meaning: '除了代表愛情，這也是一張關於「選擇與契合」的牌。請遵循你內心最真實的渴望，做出讓靈魂感到共鳴的決定。', love: '浪漫的相遇，感情迅速升溫，或是面臨關係中重要的承諾與抉擇。', career: '遇到志同道合的合作夥伴，或是面臨重要的事業岔路，請選擇你真正熱愛的路。' },
    { name: 'VII. 戰車 (The Chariot)', image: '/tarot/7.png', quote: '「堅定信念，你將克服一切阻礙。」', meaning: '代表意志力、勝利與行動。只要你保持專注，不被外在的衝突與內在的矛盾干擾，你就能駕馭目前的局勢，取得勝利。', love: '關係進展迅速，需要積極主動爭取，但也要注意控制自己的脾氣與佔有慾。', career: '充滿挑戰但能取得重大成功，適合出差、推動新專案或跨越目前的事業瓶頸。' },
    { name: 'VIII. 力量 (Strength)', image: '/tarot/8.png', quote: '「真正的強大，來自於內心的柔軟與包容。」', meaning: '這不是以暴制暴的武力，而是以柔克剛的內在力量。面對困難或恐懼，請用耐心、溫柔與愛去安撫它、轉化它。', love: '用包容與溫柔化解關係中的衝突，你們有足夠的愛去度過目前的磨合期。', career: '展現高情商的時刻，你能順利說服難搞的客戶，或優雅地解決棘手的人事問題。' },
    { name: 'IX. 隱者 (The Hermit)', image: '/tarot/9.png', quote: '「在孤獨中點亮明燈，向內尋找智慧。」', meaning: '代表反思、沉澱與尋求內在真理。現在不是向外衝刺的時候，你需要給自己一段獨處的時光，釐清真正的目標。', love: '需要個人空間，適合先理清自己的需求再進入關係。有伴者需注意精神上的疏離。', career: '暫緩腳步，重新評估職涯方向，適合獨立作業或進行深度的專業研究。' },
    { name: 'X. 命運之輪 (Wheel of Fortune)', image: '/tarot/10.png', quote: '「萬物皆有定時，順應生命之流。」', meaning: '命運的齒輪正在轉動，這預示著一個無法預期但必然發生的轉機。無論現在是低谷還是高峰，一切都在朝著更好的方向演進。', love: '可能會出現命中注定的相遇，或是關係迎來一個自然而然的重要轉折點。', career: '大環境的變化將為你帶來意想不到的好運，請保持彈性，順勢而為。' },
    { name: 'XI. 正義 (Justice)', image: '/tarot/11.png', quote: '「種下什麼因，便收穫什麼果。」', meaning: '代表公平、決策與因果法則。你需要保持客觀與理性，用更高的道德標準來衡量目前的局勢，做出最公正的裁決。', love: '關係需要平衡與誠實，適合解開誤會，或雙方開誠佈公地討論未來的責任分擔。', career: '簽署合約、談判或法律事務將得到公平的結果，所有的努力都會獲得應有的回報。' },
    { name: 'XII. 倒吊人 (The Hanged Man)', image: '/tarot/12.png', quote: '「換個角度看世界，學會放手的智慧。」', meaning: '代表犧牲、暫停與視角的轉換。當事情無法推進時，與其焦慮掙扎，不如試著停下來，用完全不同的觀點來審視僵局。', love: '感情處於停滯期，需要換位思考，或是暫時放下自己的執著，給彼此喘息的空間。', career: '欲速則不達，目前的等待與讓步是為了醞釀更大的突破，請耐心蟄伏。' },
    { name: 'XIII. 死神 (Death)', image: '/tarot/13.png', quote: '「結束，只是另一場新生的開始。」', meaning: '不要害怕這張牌！它代表深刻的轉變、割捨與重生。勇敢放下已經不再適合你的人事物，才能騰出空間迎接新的美好。', love: '揮別不適合的舊關係，或是現有關係迎來徹底的蛻變，進入全新的相處模式。', career: '勇敢結束沒有前景的項目，這是轉職、跳槽或大破大立的最佳時機。' },
    { name: 'XIV. 節制 (Temperance)', image: '/tarot/14.png', quote: '「在極端之間找到平衡，讓能量自然流動。」', meaning: '代表協調、淨化與恰到好處的融合。你需要結合對立的觀點，在工作與生活、理性與感性之間找到完美的動態平衡。', love: '雙方溝通順暢，情感在平淡中細水長流，是心靈契合度極高的一段時期。', career: '跨部門協調順利，適合進行資源整合與跨界合作，穩紮穩打將帶來長遠效益。' },
    { name: 'XV. 惡魔 (The Devil)', image: '/tarot/15.png', quote: '「直面內心的慾望，打破自我設限的枷鎖。」', meaning: '代表誘惑、物質執著與陰暗面。你是否被恐懼、成癮或有害的關係給困住了？意識到這些束縛，是你重獲自由的第一步。', love: '充滿強烈吸引力但可能帶有危險或過度依賴的關係，需注意情緒勒索。', career: '有獲得豐厚利潤的機會，但需小心職場權力鬥爭、不當誘惑或過勞的風險。' },
    { name: 'XVI. 高塔 (The Tower)', image: '/tarot/16.png', quote: '「摧毀建立在流沙上的幻象，迎接真相之光。」', meaning: '代表突如其來的改變、震撼與信仰崩塌。雖然過程可能伴隨驚嚇，但這道閃電是為了擊碎不真實的幻象，讓你建立更穩固的根基。', love: '隱藏的問題將爆發，這是徹底清理關係中未爆彈的契機，不破不立。', career: '組織重組或突發狀況，請保持彈性，這是危機也是重建事業地基的轉機。' },
    { name: 'XVII. 星星 (The Star)', image: '/tarot/17.png', quote: '「在最深的黑夜裡，星星的光芒最為璀璨。」', meaning: '在經歷了黑暗與混亂之後，星星為你帶來了療癒、平靜與希望。你的身心正在恢復平衡，靈感也將源源不絕。', love: '關係將回歸寧靜與純粹，誤會得以冰釋。單身者有望遇到精神契合的對象。', career: '充滿創意的時期，你的才華將如星光般閃耀，適合藝術、療癒或遠景規劃的工作。' },
    { name: 'XVIII. 月亮 (The Moon)', image: '/tarot/18.png', quote: '「穿越迷霧與恐懼，跟隨直覺的微光前行。」', meaning: '代表不安、潛意識與隱藏的真相。在未知的迷霧中，恐懼容易被放大。請傾聽直覺而非盲目恐慌，等待真相浮出水面。', love: '關係中充滿猜忌、敏感或不確定感，請給予彼此更多的安全感與透明度。', career: '局勢未明，避免在此時做重大決策，小心隱藏的風險或職場中的小人。' },
    { name: 'XIX. 太陽 (The Sun)', image: '/tarot/19.png', quote: '「讓光芒灑滿每一個角落，所有的陰霾都將散去。」', meaning: '這是一張充滿活力、光明與極度正向的牌！所有的困難都已成為過去，接下來迎接你的將是成功、喜悅與豐盛。', love: '感情關係明朗且充滿熱情，彼此坦誠相待。是非常適合孕育新生命或步入婚姻的時刻。', career: '無往不利！你的努力將獲得豐碩的成果與眾人的肯定，盡情展現你的光芒吧。' },
    { name: 'XX. 審判 (Judgement)', image: '/tarot/20.png', quote: '「回應靈魂的呼喚，迎接覺醒的時刻。」', meaning: '代表覆盤、重生與內在的呼喚。這是一個清算過去、原諒自己與他人的時刻。聽從你內心深處的召喚，邁向新的人生階段。', love: '舊情復燃的可能，或是現有關係經過深刻的反思後，迎來決定性的升華。', career: '過去的努力終於得到公正的評價與回報，適合重拾曾經放棄的夢想與專案。' },
    { name: 'XXI. 世界 (The World)', image: '/tarot/21.png', quote: '「完美的旅程已達終點，下一個循環即將展開。」', meaning: '代表圓滿、成功與整體的達成。你已經學會了這個階段的所有課題，享受這份充滿喜悅的成就感吧，世界就在你的腳下。', love: '感情修成正果，步入完美的下一個階段（如婚姻），或是享受深刻的靈魂伴侶關係。', career: '專案圓滿落幕，獲得巨大成功。極度適合拓展海外、跨國市場或進行遠程旅行。' }
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
    <main className="min-h-screen bg-[#050508] text-zinc-200 font-sans selection:bg-amber-500 selection:text-zinc-950 overflow-x-hidden relative">
      
      {/* 🌟 1. 增強版琉璃環境光 */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-700/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-amber-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-indigo-700/15 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

    {/* 🌟 2. 左側獨立星空：北斗七星 (真實排列、光學散射、無虛線) */}
      <div className="fixed top-0 left-0 w-full md:w-[60vw] h-screen pointer-events-none flex items-center justify-start z-0 mix-blend-screen opacity-70">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          <defs>
            <filter id="star-bloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.8" />
            </filter>
            <radialGradient id="dipper-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="30%" stopColor="#e0e7ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 北斗七星本體：依據真實星圖比例繪製 */}
          <g transform="translate(10, 40) scale(0.8)">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="7s" repeatCount="indefinite" />
            
            {/* 星辰牽引線 (極度微弱、柔和的實線，移除生硬的虛線) */}
            <polyline points="20,120 40,110 65,105 85,110 95,135 125,120 115,95 85,110" fill="none" stroke="#e0e7ff" strokeWidth="0.15" opacity="0.2" filter="url(#star-bloom)" />
            
            {/* 1. 搖光 (Alkaid) */}
            <circle cx="20" cy="120" r="3" fill="url(#dipper-glow)" />
            <circle cx="20" cy="120" r="0.6" fill="#ffffff" filter="url(#star-bloom)" />
            
            {/* 2. 開陽 (Mizar) */}
            <circle cx="40" cy="110" r="2.5" fill="url(#dipper-glow)" />
            <circle cx="40" cy="110" r="0.5" fill="#ffffff" filter="url(#star-bloom)" />
            
            {/* 3. 玉衡 (Alioth) */}
            <circle cx="65" cy="105" r="3.5" fill="url(#dipper-glow)" />
            <circle cx="65" cy="105" r="0.7" fill="#ffffff" filter="url(#star-bloom)" />
            
            {/* 4. 天權 (Megrez) */}
            <circle cx="85" cy="110" r="2" fill="url(#dipper-glow)" />
            <circle cx="85" cy="110" r="0.4" fill="#ffffff" filter="url(#star-bloom)" />
            
            {/* 5. 天璣 (Phecda) */}
            <circle cx="95" cy="135" r="2.5" fill="url(#dipper-glow)" />
            <circle cx="95" cy="135" r="0.5" fill="#ffffff" filter="url(#star-bloom)" />
            
            {/* 6. 天璇 (Merak) */}
            <circle cx="125" cy="120" r="3" fill="url(#dipper-glow)" />
            <circle cx="125" cy="120" r="0.6" fill="#ffffff" filter="url(#star-bloom)" />
            
            {/* 7. 天樞 (Dubhe) */}
            <circle cx="115" cy="95" r="4" fill="url(#dipper-glow)" />
            <circle cx="115" cy="95" r="0.8" fill="#ffffff" filter="url(#star-bloom)" />
          </g>
        </svg>
      </div>

      {/* 🌟 3. 右側深空宇宙與太陽系 (光學散射版：徹底移除死硬圓形，增加真實光暈) */}
      <div className="fixed top-0 right-0 translate-x-1/3 -translate-y-1/4 w-[150vw] min-w-[1200px] max-w-[2500px] aspect-square pointer-events-none flex items-center justify-center z-0 mix-blend-screen opacity-40 md:opacity-50">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(253,230,138,0.15)]">
          <defs>
            {/* 全局光學模糊濾鏡 (用來打破星體邊緣) */}
            <filter id="core-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
            <filter id="heavy-flare" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>

            <radialGradient id="nebula-void" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#064e3b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="20%" stopColor="#fde68a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blue-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="1" />
              <stop offset="40%" stopColor="#4f46e5" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="red-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fecdd3" stopOpacity="1" />
              <stop offset="40%" stopColor="#e11d48" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gold-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
              <stop offset="40%" stopColor="#d97706" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="green-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="1" />
              <stop offset="40%" stopColor="#059669" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="corona-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fde68a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="100" cy="100" r="120" fill="url(#nebula-void)" stroke="none" />

          {/* ✨ 漫天繁星 */}
          <g fill="#ffffff">
            <g opacity="0.3">
              <circle cx="20" cy="30" r="0.2" /> <circle cx="150" cy="10" r="0.15" /> <circle cx="180" cy="80" r="0.2" />
              <circle cx="40" cy="160" r="0.15" /> <circle cx="160" cy="170" r="0.25" /> <circle cx="10" cy="90" r="0.1" />
              <circle cx="80" cy="15" r="0.2" /> <circle cx="190" cy="140" r="0.15" /> <circle cx="50" cy="190" r="0.2" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="-360 100 100" dur="600s" repeatCount="indefinite" />
              <g opacity="0.6">
                <circle cx="45" cy="45" r="0.4" fill="url(#blue-glow)" /> <circle cx="45" cy="45" r="0.1" filter="url(#core-blur)" />
                <circle cx="165" cy="35" r="0.5" fill="url(#gold-glow)" /> <circle cx="165" cy="35" r="0.15" filter="url(#core-blur)" />
                <circle cx="130" cy="185" r="0.3" fill="url(#red-glow)" /> <circle cx="130" cy="185" r="0.1" filter="url(#core-blur)" />
                <circle cx="25" cy="135" r="0.4" fill="url(#blue-glow)" /> <circle cx="25" cy="135" r="0.1" filter="url(#core-blur)" />
              </g>
            </g>
            <g opacity="0.15">
              <path d="M -20 40 Q 100 90 220 20" stroke="url(#blue-glow)" strokeWidth="0.2" fill="none" />
              <path d="M 0 180 Q 120 120 200 190" stroke="url(#gold-glow)" strokeWidth="0.15" fill="none" />
            </g>
          </g>

          <g stroke="#fde68a" fill="none">
            {/* 📍 外圍羅盤底座 */}
            <g className="origin-center opacity-20">
              <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="400s" repeatCount="indefinite" />
              <circle cx="100" cy="100" r="95" strokeWidth="0.08" />
              <circle cx="100" cy="100" r="93" strokeWidth="0.15" strokeDasharray="0.1 2.5" />
              <circle cx="100" cy="100" r="88" strokeWidth="0.05" />
              <circle cx="100" cy="100" r="86" strokeWidth="0.08" strokeDasharray="1 8" opacity="0.5" />
              
              <g opacity="0.3">
                {Array.from({length: 12}).map((_, i) => (
                  <line key={i} x1="100" y1="5" x2="100" y2="12" transform={`rotate(${i * 30} 100 100)`} strokeWidth="0.1" />
                ))}
              </g>

              <polygon points="100,12 176.2,144 23.8,144" strokeWidth="0.05" opacity="0.2" />
              <polygon points="100,188 23.8,56 176.2,56" strokeWidth="0.05" opacity="0.2" />
              <polygon points="100,35 165,100 100,165 35,100" strokeWidth="0.05" opacity="0.1" />
            </g>

            {/* 🪐 最外層軌道 */}
            <g className="origin-center opacity-80">
              <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="200s" repeatCount="indefinite" />
              <circle cx="100" cy="100" r="80" strokeWidth="0.08" strokeDasharray="0.2 5" opacity="0.15" />
              <g transform="translate(0, 0)">
                <circle cx="100" cy="20" r="3.5" fill="url(#green-glow)" stroke="none" />
                {/* 套用濾鏡打破圓形 */}
                <circle cx="100" cy="20" r="0.5" fill="#ecfdf5" stroke="none" filter="url(#core-blur)" />
              </g>
              <circle cx="100" cy="180" r="1.5" fill="url(#gold-glow)" stroke="none" opacity="0.6" filter="url(#core-blur)" />
            </g>

            {/* 🪐 第四軌道 */}
            <g className="origin-center opacity-90">
              <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="150s" repeatCount="indefinite" />
              <circle cx="100" cy="100" r="65" strokeWidth="0.08" strokeDasharray="0.5 3" opacity="0.15" />
              <circle cx="100" cy="35" r="4.5" fill="url(#red-glow)" stroke="none" />
              <circle cx="100" cy="35" r="0.8" fill="#ffffff" stroke="none" filter="url(#core-blur)" />
              <circle cx="92" cy="38" r="0.8" fill="#fde68a" stroke="none" opacity="0.8" filter="url(#core-blur)" />
              <circle cx="108" cy="32" r="0.5" fill="#fde68a" stroke="none" opacity="0.5" filter="url(#core-blur)" />
            </g>

            {/* 🪐 第三軌道 (帶星環巨行星) */}
            <g className="origin-center">
              <animateTransform attributeName="transform" type="rotate" from="45 100 100" to="405 100 100" dur="90s" repeatCount="indefinite" />
              <circle cx="100" cy="100" r="50" strokeWidth="0.05" opacity="0.1" />
              <g transform="translate(100, 50)">
                <circle cx="0" cy="0" r="5" fill="url(#gold-glow)" stroke="none" />
                <circle cx="0" cy="0" r="1" fill="#ffffff" stroke="none" filter="url(#core-blur)" />
                <ellipse cx="0" cy="0" rx="9" ry="2" fill="none" stroke="url(#gold-glow)" strokeWidth="0.2" transform="rotate(-20)" opacity="0.8" />
              </g>
            </g>

            {/* 🪐 第二軌道 (雙星系統) */}
            <g className="origin-center opacity-[0.95]">
              <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="45s" repeatCount="indefinite" />
              <circle cx="100" cy="100" r="35" strokeWidth="0.08" strokeDasharray="0.3 2" opacity="0.15" />
              <circle cx="100" cy="65" r="3" fill="url(#blue-glow)" stroke="none" />
              <circle cx="100" cy="65" r="0.5" fill="#ffffff" stroke="none" filter="url(#core-blur)" />
              <g transform="translate(100, 65)">
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="5s" repeatCount="indefinite" />
                <circle cx="0" cy="-6" r="2" fill="url(#gold-glow)" stroke="none" opacity="0.9" />
                <circle cx="0" cy="-6" r="0.3" fill="#ffffff" stroke="none" filter="url(#core-blur)" />
              </g>
            </g>

            {/* ☄️ 彗星軌跡 */}
            <g className="origin-center opacity-60">
              <animateTransform attributeName="transform" type="rotate" from="120 100 100" to="480 100 100" dur="25s" repeatCount="indefinite" />
              <circle cx="100" cy="10" r="1.5" fill="#ffffff" stroke="none" filter="url(#core-blur)" />
              <path d="M 100 10 Q 105 25 110 40" stroke="url(#blue-glow)" strokeWidth="0.6" fill="none" opacity="0.7" />
              <path d="M 100 10 Q 108 25 115 45" stroke="url(#blue-glow)" strokeWidth="0.2" fill="none" opacity="0.3" />
            </g>

            {/* 🌟 極內圈軌道 1 */}
            <g className="origin-center opacity-[0.95]">
              <animateTransform attributeName="transform" type="rotate" from="90 100 100" to="450 100 100" dur="12s" repeatCount="indefinite" />
              <circle cx="100" cy="100" r="12" strokeWidth="0.05" opacity="0.15" />
              <circle cx="100" cy="88" r="1.5" fill="url(#gold-glow)" stroke="none" />
              <circle cx="100" cy="88" r="0.6" fill="#ffffff" stroke="none" filter="url(#core-blur)" />
            </g>

            {/* 🌟 極內圈軌道 2 */}
            <g className="origin-center opacity-90">
              <animateTransform attributeName="transform" type="rotate" from="270 100 100" to="-90 100 100" dur="20s" repeatCount="indefinite" />
              <circle cx="100" cy="100" r="22" strokeWidth="0.08" strokeDasharray="0.5 3" opacity="0.15" />
              <circle cx="100" cy="78" r="2.5" fill="url(#corona-glow)" stroke="none" />
              <circle cx="100" cy="78" r="0.8" fill="#ffffff" stroke="none" filter="url(#core-blur)" />
            </g>

            {/* ☀️ 太陽/恆星中心 (加入十字耀光打破完美圓形) */}
            <circle cx="100" cy="100" r="28" strokeWidth="0.08" strokeDasharray="0.2 2" opacity="0.15" />
            
            <g className="origin-center opacity-70">
              <animateTransform attributeName="transform" type="scale" values="1; 1.05; 1" dur="4s" repeatCount="indefinite" />
              <circle cx="100" cy="100" r="10" fill="url(#corona-glow)" stroke="none" />
            </g>

            {/* 核心改用光學暈染，取代原本死白的圓點 */}
            <circle cx="100" cy="100" r="6" fill="url(#center-glow)" stroke="none" />
            
            {/* 加入 Lens Flare (鏡頭耀光)，徹底消除貼紙感 */}
            <path d="M 100 85 L 100 115 M 85 100 L 115 100" stroke="#ffffff" strokeWidth="0.8" filter="url(#heavy-flare)" opacity="0.9" />
            <path d="M 95 95 L 105 105 M 95 105 L 105 95" stroke="#fde68a" strokeWidth="0.5" filter="url(#core-blur)" opacity="0.5" />
            
          </g>
        </svg>
      </div>
      
      {/* 🌟 星塵紋理疊加 */}
      <div className="absolute inset-0 opacity-[0.4] bg-[url(https://www.transparenttextures.com/patterns/stardust.png)] pointer-events-none mix-blend-overlay"></div>

      <section className="relative pt-32 pb-20 px-4 md:px-8 z-10 border-b border-zinc-900/50 min-h-[85vh] flex flex-col justify-center">
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
                          
                          <div className="w-full md:w-1/3 flex justify-center shrink-0">
                            <Image 
                              src={drawnCard.image} 
                              alt={drawnCard.name} 
                              width={200}
                              height={350}
                              priority={true}
                              className="w-48 h-auto rounded-xl shadow-2xl shadow-indigo-900/30 border border-stone-700" 
                            />
                          </div>

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

                {activeTool === 'numerology' && (
                  <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm animate-in zoom-in-95 duration-300">
                    <h3 className="text-2xl font-serif text-stone-100 mb-2">生命靈數計算</h3>
                    <p className="text-stone-400 mb-8 max-w-md mx-auto text-sm">輸入您的西元出生年月日，探索您靈魂的隱藏天賦與人生課題。</p>
                    
                    <div className="max-w-md mx-auto space-y-6 mb-8">
                       <div className="grid grid-cols-3 gap-3">
                          <select 
                             value={birthDateStr.substring(0, 4) || '1990'} 
                             onChange={(e) => {
                               const year = e.target.value;
                               const month = birthDateStr.substring(4, 6) || '01';
                               const day = birthDateStr.substring(6, 8) || '01';
                               setBirthDateStr(`${year}${month}${day}`);
                             }}
                             className="w-full px-3 py-3.5 bg-stone-800 border border-stone-700 hover:border-amber-500/50 rounded-xl focus:outline-none focus:border-amber-500 text-stone-200 text-sm text-center appearance-none cursor-pointer transition-all"
                          >
                             {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y} 年</option>)}
                          </select>
                          <select 
                             value={birthDateStr.substring(4, 6) || '01'} 
                             onChange={(e) => {
                               const year = birthDateStr.substring(0, 4) || '1990';
                               const month = e.target.value.padStart(2, '0');
                               const day = birthDateStr.substring(6, 8) || '01';
                               setBirthDateStr(`${year}${month}${day}`);
                             }}
                             className="w-full px-3 py-3.5 bg-stone-800 border border-stone-700 hover:border-amber-500/50 rounded-xl focus:outline-none focus:border-amber-500 text-stone-200 text-sm text-center appearance-none cursor-pointer transition-all"
                          >
                             {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={String(m).padStart(2, '0')}>{m} 月</option>)}
                          </select>
                          <select 
                             value={birthDateStr.substring(6, 8) || '01'} 
                             onChange={(e) => {
                               const year = birthDateStr.substring(0, 4) || '1990';
                               const month = birthDateStr.substring(4, 6) || '01';
                               const day = e.target.value.padStart(2, '0');
                               setBirthDateStr(`${year}${month}${day}`);
                             }}
                             className="w-full px-3 py-3.5 bg-stone-800 border border-stone-700 hover:border-amber-500/50 rounded-xl focus:outline-none focus:border-amber-500 text-stone-200 text-sm text-center appearance-none cursor-pointer transition-all"
                          >
                             {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={String(d).padStart(2, '0')}>{d} 日</option>)}
                          </select>
                       </div>
                      <button onClick={calculateLifePath} className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> 啟動靈魂密碼
                      </button>
                    </div>

                    {lifePath && LIFE_PATH_DESC[lifePath] && (
                      <div className="max-w-2xl mx-auto bg-stone-800/50 border border-amber-500/20 rounded-3xl p-6 md:p-8 text-left animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="flex items-center gap-6 mb-6 border-b border-stone-700/50 pb-6 relative z-10">
                          <div className="w-20 h-20 rounded-full bg-stone-900 border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center shrink-0">
                            <span className="text-4xl font-serif font-bold text-amber-400 drop-shadow-md">{lifePath}</span>
                          </div>
                          <div>
                            <div className="text-amber-500 text-xs font-bold tracking-widest mb-1 uppercase">Your Life Path</div>
                            <h4 className="text-2xl md:text-3xl font-bold text-stone-100 tracking-wide">{LIFE_PATH_DESC[lifePath].title}</h4>
                          </div>
                        </div>

                        <div className="space-y-6 mb-8 relative z-10">
                          <div className="bg-stone-900/40 p-5 rounded-2xl border border-stone-700/50">
                            <h5 className="text-amber-400 font-medium flex items-center gap-2 mb-2"><Star className="w-4 h-4"/> 天賦特質</h5>
                            <p className="text-stone-300 text-sm leading-relaxed">{LIFE_PATH_DESC[lifePath].traits}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-stone-900/50 p-5 rounded-2xl border border-stone-700/50 hover:border-rose-500/30 transition-colors">
                              <h5 className="text-rose-400 text-sm font-bold mb-2 flex items-center gap-1.5"><Heart className="w-4 h-4"/> 感情模式</h5>
                              <p className="text-stone-400 text-xs leading-relaxed">{LIFE_PATH_DESC[lifePath].love}</p>
                            </div>
                            <div className="bg-stone-900/50 p-5 rounded-2xl border border-stone-700/50 hover:border-blue-500/30 transition-colors">
                              <h5 className="text-blue-400 text-sm font-bold mb-2 flex items-center gap-1.5"><Briefcase className="w-4 h-4"/> 適合事業</h5>
                              <p className="text-stone-400 text-xs leading-relaxed">{LIFE_PATH_DESC[lifePath].career}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 mt-2">
                          <button onClick={() => handleGuidanceClick('塔羅')} className="flex-1 py-3.5 bg-stone-900 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-stone-800 text-indigo-300 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                            <Moon className="w-4 h-4" /> 感情困惑？尋找專屬塔羅師
                          </button>
                          <button onClick={() => handleGuidanceClick('八字')} className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2 text-sm">
                            <Compass className="w-4 h-4" /> 探索流年？尋找八字大師詳批
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