'use client';

import React, { useState, useMemo } from 'react';
import { Loader2, Sparkles, Compass, ArrowRight, Layers } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';
import { Solar } from 'lunar-javascript';

interface BaziCalculatorProps {
  onActionClick: () => void;
  actionText: string;
}

interface LiuNian {
  year: number;
  age: number;
  gan: string;
  zhi: string;
}

interface DaYun {
  startYear: number;
  startAge: number;
  gan: string;
  zhi: string;
  liuNians: LiuNian[];
}

interface BaziPillar {
  pillar: string;
  stem: string;
  stemElement: string;
  branch: string;
  branchElement: string;
  hiddenStems: string[];
}

// 輔助函數：將天干地支轉換為五行字元
const getWuXingChar = (char: string): string => {
  const wuxingMap: Record<string, string> = {
    '甲': '木', '乙': '木', '寅': '木', '卯': '木',
    '丙': '火', '丁': '火', '巳': '火', '午': '火',
    '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
    '庚': '金', '辛': '金', '申': '金', '酉': '金',
    '壬': '水', '癸': '水', '亥': '水', '子': '水'
  };
  return wuxingMap[char] || '';
};

const getElementColor = (element: string) => {
  switch(element) {
    case '木': return 'text-emerald-400'; 
    case '火': return 'text-rose-400';    
    case '土': return 'text-amber-500';   
    case '金': return 'text-yellow-200';  
    case '水': return 'text-cyan-400';    
    default: return 'text-stone-300';
  }
};

const renderCustomTick = ({ payload, x, y }: any) => {
  let color = '#a8a29e'; 
  if (payload.value.includes('木')) color = '#34d399';
  else if (payload.value.includes('火')) color = '#fb7185';
  else if (payload.value.includes('土')) color = '#f59e0b';
  else if (payload.value.includes('金')) color = '#fef08a';
  else if (payload.value.includes('水')) color = '#22d3ee';

  return (
    <text x={x} y={y} textAnchor="middle" fill={color} fontSize={12} fontWeight={500} className="font-serif">
      {payload.value}
    </text>
  );
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

// 預設資料產生器
const generateDefaultData = () => {
  const solar = Solar.fromYmdHms(1991, 6, 2, 12, 0, 0);
  const baZi = solar.getLunar().getEightChar();
  const yun = baZi.getYun(0);
  const daYunArr: DaYun[] = yun.getDaYun().map((dy: any) => ({
    startYear: dy.getStartYear(),
    startAge: dy.getStartAge(),
    gan: dy.getGan(),
    zhi: dy.getZhi(),
    liuNians: dy.getLiuNian().map((ln: any) => ({
      year: ln.getYear(),
      age: ln.getAge(),
      gan: ln.getGan(),
      zhi: ln.getZhi()
    }))
  }));

  return {
    bazi: [
      { pillar: '年柱', stem: baZi.getYearGan(), stemElement: '金', branch: baZi.getYearZhi(), branchElement: '火', hiddenStems: baZi.getYearHideGan() },
      { pillar: '月柱', stem: baZi.getMonthGan(), stemElement: '水', branch: baZi.getMonthZhi(), branchElement: '火', hiddenStems: baZi.getMonthHideGan() },
      { pillar: '日柱', stem: baZi.getDayGan(), stemElement: '土', branch: baZi.getDayZhi(), branchElement: '水', hiddenStems: baZi.getDayHideGan() },
      { pillar: '時柱', stem: baZi.getTimeGan(), stemElement: '土', branch: baZi.getTimeZhi(), branchElement: '火', hiddenStems: baZi.getTimeHideGan() },
    ] as BaziPillar[],
    daYuns: daYunArr
  };
};

const defaultData = generateDefaultData();

export default function BaziCalculator({ onActionClick, actionText }: BaziCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [birthData, setBirthData] = useState({ year: '1991', month: '6', day: '2', time: '12:00', gender: 'F' });
  
  const [baziResult, setBaziResult] = useState<BaziPillar[]>(defaultData.bazi);
  const [daYuns, setDaYuns] = useState<DaYun[]>(defaultData.daYuns);
  
  const [activeTab, setActiveTab] = useState<'chart' | 'dayun'>('chart');
  
  // 🌟 核心選取狀態
  const [selectedDaYunIndex, setSelectedDaYunIndex] = useState(1);
  const [selectedLiuNianIndex, setSelectedLiuNianIndex] = useState(0); // 記錄點選了哪個流年
  
  // 🌟 雷達圖的疊加開關
  const [showDaYunInChart, setShowDaYunInChart] = useState(false);
  const [showLiuNianInChart, setShowLiuNianInChart] = useState(false);

  const daysInMonth = new Date(parseInt(birthData.year), parseInt(birthData.month), 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    setTimeout(() => {
      const year = parseInt(birthData.year);
      const month = parseInt(birthData.month);
      const day = parseInt(birthData.day);
      const [hour, minute] = birthData.time.split(':').map(Number);
      
      const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
      const lunar = solar.getLunar();
      const baZi = lunar.getEightChar();

      const newBazi: BaziPillar[] = [
        { 
          pillar: '年柱', 
          stem: baZi.getYearGan(), stemElement: baZi.getYearWuXing().charAt(0),
          branch: baZi.getYearZhi(), branchElement: baZi.getYearWuXing().charAt(1),
          hiddenStems: baZi.getYearHideGan()
        },
        { 
          pillar: '月柱', 
          stem: baZi.getMonthGan(), stemElement: baZi.getMonthWuXing().charAt(0),
          branch: baZi.getMonthZhi(), branchElement: baZi.getMonthWuXing().charAt(1),
          hiddenStems: baZi.getMonthHideGan()
        },
        { 
          pillar: '日柱', 
          stem: baZi.getDayGan(), stemElement: baZi.getDayWuXing().charAt(0),
          branch: baZi.getDayZhi(), branchElement: baZi.getDayWuXing().charAt(1),
          hiddenStems: baZi.getDayHideGan()
        },
        { 
          pillar: '時柱', 
          stem: baZi.getTimeGan(), stemElement: baZi.getTimeWuXing().charAt(0),
          branch: baZi.getTimeZhi(), branchElement: baZi.getTimeWuXing().charAt(1),
          hiddenStems: baZi.getTimeHideGan()
        },
      ];

      const yun = baZi.getYun(birthData.gender === 'M' ? 1 : 0);
      const parsedDaYuns: DaYun[] = yun.getDaYun().map((dy: any) => ({
        startYear: dy.getStartYear(),
        startAge: dy.getStartAge(),
        gan: dy.getGan(),
        zhi: dy.getZhi(),
        liuNians: dy.getLiuNian().map((ln: any) => ({
          year: ln.getYear(),
          age: ln.getAge(),
          gan: ln.getGan(),
          zhi: ln.getZhi()
        }))
      }));

      setBaziResult(newBazi);
      setDaYuns(parsedDaYuns);
      setSelectedDaYunIndex(1);
      setSelectedLiuNianIndex(0); // 重新計算時重置流年選取
      setActiveTab('dayun'); // 計算完自動跳轉到大運讓客人看
      setShowDaYunInChart(false);
      setShowLiuNianInChart(false);
      setIsCalculating(false);
    }, 800);
  };

  // 🌟 動態計算雙層雷達圖資料 (本命 vs 運勢疊加)
  const dynamicChartData = useMemo(() => {
    let baseCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    
    // 1. 計算先天本命五行
    baziResult.forEach(pillar => {
      if (pillar.stemElement) baseCount[pillar.stemElement] += 1;
      if (pillar.branchElement) baseCount[pillar.branchElement] += 1;
    });

    let currentCount = { ...baseCount };

    // 2. 疊加目前選中大運五行
    if (showDaYunInChart && daYuns[selectedDaYunIndex]) {
       const dy = daYuns[selectedDaYunIndex];
       const ganElement = getWuXingChar(dy.gan);
       const zhiElement = getWuXingChar(dy.zhi);
       if (ganElement) currentCount[ganElement] += 1.5; // 大運權重稍高
       if (zhiElement) currentCount[zhiElement] += 1.5;
    }

    // 3. 疊加目前選中流年五行
    if (showLiuNianInChart && daYuns[selectedDaYunIndex] && daYuns[selectedDaYunIndex].liuNians[selectedLiuNianIndex]) {
       const ln = daYuns[selectedDaYunIndex].liuNians[selectedLiuNianIndex];
       const ganElement = getWuXingChar(ln.gan);
       const zhiElement = getWuXingChar(ln.zhi);
       if (ganElement) currentCount[ganElement] += 1;
       if (zhiElement) currentCount[zhiElement] += 1;
    }

    return [
      { subject: '金 (決斷)', base: 20 + (baseCount['金'] * 15), current: 20 + (currentCount['金'] * 15), fullMark: 100 },
      { subject: '木 (生機)', base: 20 + (baseCount['木'] * 15), current: 20 + (currentCount['木'] * 15), fullMark: 100 },
      { subject: '水 (智慧)', base: 20 + (baseCount['水'] * 15), current: 20 + (currentCount['水'] * 15), fullMark: 100 },
      { subject: '火 (熱情)', base: 20 + (baseCount['火'] * 15), current: 20 + (currentCount['火'] * 15), fullMark: 100 },
      { subject: '土 (包容)', base: 20 + (baseCount['土'] * 15), current: 20 + (currentCount['土'] * 15), fullMark: 100 },
    ];
  }, [baziResult, daYuns, selectedDaYunIndex, selectedLiuNianIndex, showDaYunInChart, showLiuNianInChart]);


  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
      
      {/* 左側表單說明區 (保持不變) */}
      <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium tracking-widest uppercase shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> 正統命理 × 現代心理
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-br from-stone-100 via-stone-200 to-stone-400 font-serif">
            洞悉先天宿命
          </h2>
          <p className="text-stone-400 text-base md:text-lg max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
            嚴謹推算天干地支，結合專業心理分析，為您的先天命格與人生十字路口提供最深度的指引。
          </p>
        </div>

        <form onSubmit={handleCalculate} className="bg-stone-900/60 backdrop-blur-xl border border-stone-800 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-lg mx-auto lg:mx-0 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">出生日期 (國曆)</label>
              <div className="grid grid-cols-3 gap-3">
                <select value={birthData.year} onChange={e => setBirthData({...birthData, year: e.target.value})} className="w-full px-3 py-3.5 bg-stone-950/80 border border-stone-800 hover:border-emerald-600/50 rounded-xl focus:outline-none focus:border-emerald-500 text-stone-200 text-sm text-center appearance-none cursor-pointer transition-all">
                  {years.map(y => <option key={y} value={y}>{y} 年</option>)}
                </select>
                <select value={birthData.month} onChange={e => {
                    const newMonth = e.target.value;
                    const newDaysInMonth = new Date(parseInt(birthData.year), parseInt(newMonth), 0).getDate();
                    const adjustedDay = parseInt(birthData.day) > newDaysInMonth ? String(newDaysInMonth) : birthData.day;
                    setBirthData({...birthData, month: newMonth, day: adjustedDay});
                  }} className="w-full px-3 py-3.5 bg-stone-950/80 border border-stone-800 hover:border-emerald-600/50 rounded-xl focus:outline-none focus:border-emerald-500 text-stone-200 text-sm text-center appearance-none cursor-pointer transition-all">
                  {months.map(m => <option key={m} value={m}>{m} 月</option>)}
                </select>
                <select value={birthData.day} onChange={e => setBirthData({...birthData, day: e.target.value})} className="w-full px-3 py-3.5 bg-stone-950/80 border border-stone-800 hover:border-emerald-600/50 rounded-xl focus:outline-none focus:border-emerald-500 text-stone-200 text-sm text-center appearance-none cursor-pointer transition-all">
                  {days.map(d => <option key={d} value={d}>{d} 日</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-2">出生時間</label>
                <input type="time" required value={birthData.time} onChange={e => setBirthData({...birthData, time: e.target.value})} className="w-full px-4 py-3.5 bg-stone-950/80 border border-stone-800 hover:border-emerald-600/50 rounded-xl focus:outline-none focus:border-emerald-500 text-stone-200 text-sm [color-scheme:dark] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-2">生理性別</label>
                <select value={birthData.gender} onChange={e => setBirthData({...birthData, gender: e.target.value})} className="w-full px-4 py-3.5 bg-stone-950/80 border border-stone-800 hover:border-emerald-600/50 rounded-xl focus:outline-none focus:border-emerald-500 text-stone-200 text-sm cursor-pointer transition-all">
                  <option value="M">男 (乾造)</option>
                  <option value="F">女 (坤造)</option>
                </select>
              </div>
            </div>
          </div>
          <button type="submit" disabled={isCalculating} className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-base relative z-10 active:scale-95">
            {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Compass className="w-5 h-5" />}
            {isCalculating ? '推演天機中...' : '洞察專屬命盤'}
          </button>
        </form>
      </div>

      {/* 右側命盤展示區 */}
      <div className="lg:col-span-6 bg-stone-900/60 backdrop-blur-xl border border-stone-800 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {isCalculating && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <Compass className="w-12 h-12 animate-spin text-emerald-500 mb-3" />
            <p className="text-sm font-bold text-stone-300 tracking-widest">窺探天機中...</p>
          </div>
        )}
        
        <div className="text-center mb-5">
          <h3 className="font-bold text-xl text-stone-100 tracking-wider font-serif">先天命格分佈</h3>
          <div className="w-12 h-0.5 bg-emerald-600 mx-auto mt-2"></div>
        </div>
        
        <div className="bg-stone-950/60 rounded-2xl p-4 border border-stone-800/80 flex justify-between gap-2 md:gap-3 text-center mb-6 shadow-inner relative z-10">
          {baziResult.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1.5">
              <span className="text-[10px] text-stone-500 font-medium mb-1 tracking-widest">{item.pillar}</span>
              <div className="w-full bg-stone-900 border border-stone-700/50 rounded-xl py-2.5 shadow-sm text-xl font-bold font-serif flex items-center justify-center">
                <span className={getElementColor(item.stemElement)}>{item.stem}</span>
              </div>
              <div className="w-full bg-stone-900 border border-stone-700/50 rounded-xl py-3 shadow-sm flex flex-col items-center justify-center min-h-[75px]">
                <span className={`text-xl font-bold font-serif mb-1 ${getElementColor(item.branchElement)}`}>{item.branch}</span>
                <div className="flex gap-1 mt-1 justify-center flex-wrap">
                  {item.hiddenStems.map((hs: string, idx: number) => (
                    <span key={idx} className="text-[9px] text-stone-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">{hs}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex bg-stone-950/80 p-1 rounded-xl mb-5 border border-stone-800 relative z-10">
          <button onClick={() => setActiveTab('chart')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex justify-center items-center gap-1.5 ${activeTab === 'chart' ? 'bg-stone-800 text-stone-200 shadow' : 'text-stone-500 hover:text-stone-300'}`}>
            <Radar className="w-4 h-4" /> 五行強弱
          </button>
          <button onClick={() => setActiveTab('dayun')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex justify-center items-center gap-1.5 ${activeTab === 'dayun' ? 'bg-stone-800 text-stone-200 shadow' : 'text-stone-500 hover:text-stone-300'}`}>
            <Layers className="w-4 h-4" /> 大運與流年
          </button>
        </div>

        <div className="relative z-10 min-h-[220px]">
          
          {/* 🌟 五行雷達圖 (含動態疊加勾選區) */}
          {activeTab === 'chart' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="h-[200px] w-full -ml-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={dynamicChartData}>
                    <PolarGrid stroke="#292524" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={renderCustomTick} />
                    
                    {/* 本命雷達 (永遠顯示) */}
                    <Radar name="先天命格" dataKey="base" stroke="#10b981" strokeWidth={2} fill="#34d399" fillOpacity={0.2} />
                    
                    {/* 後天運勢雷達 (勾選時顯示金色) */}
                    {(showDaYunInChart || showLiuNianInChart) && (
                      <Radar name="後天運勢疊加" dataKey="current" stroke="#f59e0b" strokeWidth={2} fill="#fbbf24" fillOpacity={0.3} />
                    )}
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 使用者互動：動態勾選疊加運勢 */}
              <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-4 bg-stone-950/50 p-3 rounded-xl border border-stone-800/50">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors">
                  <input type="checkbox" checked={showDaYunInChart} onChange={e => setShowDaYunInChart(e.target.checked)} className="rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-amber-500/50" />
                  疊加大運 ({daYuns[selectedDaYunIndex]?.gan}{daYuns[selectedDaYunIndex]?.zhi})
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors">
                  <input type="checkbox" checked={showLiuNianInChart} onChange={e => setShowLiuNianInChart(e.target.checked)} className="rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-amber-500/50" />
                  疊加流年 ({daYuns[selectedDaYunIndex]?.liuNians[selectedLiuNianIndex]?.gan}{daYuns[selectedDaYunIndex]?.liuNians[selectedLiuNianIndex]?.zhi})
                </label>
              </div>
            </div>
          )}

          {/* 大運流年互動網格 */}
          {activeTab === 'dayun' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="flex overflow-x-auto pb-3 gap-2 snap-x scrollbar-hide mb-2">
                {daYuns.slice(1, 10).map((dy, idx) => {
                  const actualIndex = idx + 1;
                  const isSelected = selectedDaYunIndex === actualIndex;
                  return (
                    <div 
                      key={actualIndex} 
                      onClick={() => {
                        setSelectedDaYunIndex(actualIndex);
                        setSelectedLiuNianIndex(0); // 切換大運時，流年預設選回第一年
                      }}
                      className={`shrink-0 snap-start w-16 py-2.5 rounded-xl border flex flex-col items-center cursor-pointer transition-all ${
                        isSelected
                        ? 'bg-emerald-900/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] transform scale-105'
                        : 'bg-stone-900/50 border-stone-800 hover:border-stone-600 hover:bg-stone-800'
                      }`}
                    >
                      <span className="text-[9px] text-stone-500 mb-1">{dy.startAge}歲</span>
                      <span className={`text-lg font-serif font-bold leading-tight ${getElementColor(getWuXingChar(dy.gan))}`}>{dy.gan}</span>
                      <span className={`text-lg font-serif font-bold leading-tight ${getElementColor(getWuXingChar(dy.zhi))}`}>{dy.zhi}</span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-emerald-500/80 tracking-widest">
                    【{daYuns[selectedDaYunIndex]?.gan}{daYuns[selectedDaYunIndex]?.zhi}大運】流年走勢
                  </span>
                  <span className="text-[10px] text-stone-500">點擊流年可至圖表疊加查看</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {/* 🌟 讓流年網格可以點選 */}
                  {daYuns[selectedDaYunIndex]?.liuNians.map((ln, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedLiuNianIndex(i)}
                      className={`flex flex-col items-center py-2 rounded-lg border shadow-sm cursor-pointer transition-all ${
                        selectedLiuNianIndex === i 
                        ? 'bg-amber-900/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)] transform scale-105' 
                        : 'bg-stone-900/80 border-stone-800/50 hover:bg-stone-800 hover:border-stone-600'
                      }`}
                    >
                      <span className="text-[9px] text-stone-500 mb-1">{ln.year}</span>
                      <div className="flex gap-0.5">
                        <span className={`text-sm font-serif font-bold ${getElementColor(getWuXingChar(ln.gan))}`}>{ln.gan}</span>
                        <span className={`text-sm font-serif font-bold ${getElementColor(getWuXingChar(ln.zhi))}`}>{ln.zhi}</span>
                      </div>
                      <span className="text-[9px] text-stone-500 mt-1">{ln.age}歲</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-5 mt-4 border-t border-stone-800 relative z-10">
          <button onClick={onActionClick} className="w-full py-4 bg-stone-100 text-stone-900 rounded-xl font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2">
            {actionText} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}