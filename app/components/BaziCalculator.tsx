'use client';

import React, { useState } from 'react';
import { Loader2, Sparkles, Compass, ArrowRight } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Solar, Lunar } from 'lunar-javascript';

interface BaziCalculatorProps {
  onActionClick: () => void;
  actionText: string;
}

const DEFAULT_CHART_DATA = [
  { subject: '金 (決斷)', A: 50, fullMark: 100 },
  { subject: '木 (生機)', A: 50, fullMark: 100 },
  { subject: '水 (智慧)', A: 50, fullMark: 100 },
  { subject: '火 (熱情)', A: 50, fullMark: 100 },
  { subject: '土 (包容)', A: 50, fullMark: 100 },
];

const DEFAULT_BAZI_DATA = [
  { pillar: '年柱', stem: '甲', stemElement: '木', branch: '辰', branchElement: '土', hiddenStems: ['戊', '乙', '癸'] },
  { pillar: '月柱', stem: '丙', stemElement: '火', branch: '寅', branchElement: '木', hiddenStems: ['甲', '丙', '戊'] },
  { pillar: '日柱', stem: '戊', stemElement: '土', branch: '申', branchElement: '金', hiddenStems: ['庚', '壬', '戊'] },
  { pillar: '時柱', stem: '丁', stemElement: '火', branch: '巳', branchElement: '火', hiddenStems: ['丙', '庚', '戊'] },
];

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

export default function BaziCalculator({ onActionClick, actionText }: BaziCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [birthData, setBirthData] = useState({ year: '1991', month: '6', day: '2', time: '12:00', gender: 'F' });
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
  const [baziResult, setBaziResult] = useState(DEFAULT_BAZI_DATA);

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

      const newBazi = [
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

      let elementsCount = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
      newBazi.forEach(pillar => {
        if (pillar.stemElement) elementsCount[pillar.stemElement as keyof typeof elementsCount] += 1;
        if (pillar.branchElement) elementsCount[pillar.branchElement as keyof typeof elementsCount] += 1;
      });

      const newChart = [
        { subject: '金 (決斷)', A: 20 + (elementsCount['金'] * 15), fullMark: 100 },
        { subject: '木 (生機)', A: 20 + (elementsCount['木'] * 15), fullMark: 100 },
        { subject: '水 (智慧)', A: 20 + (elementsCount['水'] * 15), fullMark: 100 },
        { subject: '火 (熱情)', A: 20 + (elementsCount['火'] * 15), fullMark: 100 },
        { subject: '土 (包容)', A: 20 + (elementsCount['土'] * 15), fullMark: 100 },
      ];

      setBaziResult(newBazi);
      setChartData(newChart);

      localStorage.setItem('userBaziData', JSON.stringify({ bazi: newBazi, chart: newChart }));
      setIsCalculating(false);
    }, 800);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
      
      {/* 左側表單說明區 */}
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
          <button type="submit" disabled={isCalculating} className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-base relative z-10">
            {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Compass className="w-5 h-5" />}
            {isCalculating ? '推演天機中...' : '洞察專屬命盤'}
          </button>
        </form>
      </div>

      {/* 右側命盤與雷達圖展示區 */}
      <div className="lg:col-span-6 bg-stone-900/60 backdrop-blur-xl border border-stone-800 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {isCalculating && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <Compass className="w-12 h-12 animate-spin text-emerald-500 mb-3" />
            <p className="text-sm font-bold text-stone-300 tracking-widest">窺探天機中...</p>
          </div>
        )}
        <div className="text-center mb-6">
          <h3 className="font-bold text-xl text-stone-100 tracking-wider font-serif">先天命格分佈</h3>
          <div className="w-12 h-0.5 bg-emerald-600 mx-auto mt-2"></div>
        </div>
        
        <div className="bg-stone-950/60 rounded-2xl p-4 border border-stone-800/80 flex justify-between gap-3 text-center mb-6 shadow-inner relative z-10">
          {baziResult.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1.5">
              <span className="text-[10px] text-stone-500 font-medium mb-1 tracking-widest">{item.pillar}</span>
              <div className="w-full bg-stone-900 border border-stone-700/50 rounded-xl py-2.5 shadow-sm text-xl font-bold font-serif flex items-center justify-center">
                <span className={getElementColor(item.stemElement)}>{item.stem}</span>
              </div>
              <div className="w-full bg-stone-900 border border-stone-700/50 rounded-xl py-3 shadow-sm flex flex-col items-center justify-center min-h-[75px]">
                <span className={`text-xl font-bold font-serif mb-1 ${getElementColor(item.branchElement)}`}>{item.branch}</span>
                <div className="flex gap-1 mt-1 justify-center flex-wrap">
                  {item.hiddenStems.map((hs, idx) => (
                    <span key={idx} className="text-[9px] text-stone-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">{hs}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[200px] w-full -ml-2 relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
              <PolarGrid stroke="#292524" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="subject" tick={renderCustomTick} />
              <Radar name="五行" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#34d399" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="pt-4 mt-2 border-t border-stone-800 relative z-10">
          <button onClick={onActionClick} className="w-full py-4 bg-stone-100 text-stone-900 rounded-xl font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2">
            {actionText} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}