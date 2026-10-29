// app/components/MasterDetailModal.tsx
'use client';

import React from 'react';
import { X, Star, ShieldCheck, ScrollText, Sparkles, Clock, CreditCard, Power } from 'lucide-react';
import BaziCalculator from './BaziCalculator';
import BookingModal from './BookingModal';

interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface MasterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  master: any;
}

export default function MasterDetailModal({ isOpen, onClose, master }: MasterDetailModalProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);

  if (!isOpen || !master) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-stone-900/60 backdrop-blur-sm transition-opacity">
      {/* 點擊旁邊的黑色背景可以關閉視窗 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 側邊滑出的面板設計 (類似抽屜) */}
      <div className="relative w-full max-w-2xl h-full bg-stone-50 shadow-2xl animate-in slide-in-from-right-8 duration-300 flex flex-col overflow-hidden">
        
        {/* 關閉按鈕 */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-stone-900/40 hover:bg-stone-900/60 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto pb-24">
          {/* 頂部大圖 */}
          <div className="relative h-64 w-full bg-stone-900">
            {master.imageUrl ? (
               <img src={master.imageUrl} alt={master.name} className="w-full h-full object-cover opacity-80" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-stone-500">無照片</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-stone-50/20 to-transparent" />
            
            <div className="absolute top-4 left-4 z-10">
              {master.is_accepting_orders ? (
                <span className="px-3 py-1 bg-emerald-500/90 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm"><Power className="w-3 h-3"/> 接單中</span>
              ) : (
                <span className="px-3 py-1 bg-stone-800/80 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm"><Power className="w-3 h-3"/> 休息中</span>
              )}
            </div>
          </div>

          <div className="px-6 md:px-10 -mt-12 relative z-10 space-y-8">
            {/* 標題與簡介卡片 */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-100 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-semibold text-stone-900">{master.name}</h1>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    平台認證
                  </span>
                </div>
                <p className="text-sm text-stone-500 font-light">{master.lineage}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                 <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="font-bold text-stone-900">{master.rating}</span>
                 </div>
                 <span className="text-stone-300">|</span>
                 <span className="text-stone-500">{master.reviews} 則評價</span>
              </div>
            </div>

            {/* 🌟 測算工具 */}
            <div className="w-full">
              <BaziCalculator 
                onActionClick={() => {
                  if(master.is_accepting_orders) setIsBookingModalOpen(true);
                }} 
                actionText={master.is_accepting_orders ? "立即預約大師為您解盤" : "大師目前休息中"} 
              />
            </div>

            {/* 關於大師 */}
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-medium text-stone-900 flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-stone-400" /> 關於導師
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light whitespace-pre-wrap">
                  {master.bio || '導師尚未提供詳細介紹。'}
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-medium text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-stone-400" /> 擅長領域
                </h3>
                <div className="flex flex-wrap gap-2">
                  {master.tags?.map((item: string, index: number) => (
                    <span key={index} className="px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs">
                      #{item}
                    </span>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-medium text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-stone-400" /> 服務項目
                </h3>
                <div className="space-y-2">
                  {master.services && master.services.length > 0 ? (
                    master.services.map((service: ServiceItem) => (
                      <div key={service.id} className="flex justify-between items-center p-3 bg-white border border-stone-100 rounded-xl shadow-sm">
                        <div>
                          <h4 className="font-medium text-stone-900 text-sm">{service.name}</h4>
                          <p className="text-xs text-stone-500 mt-0.5"><Clock className="w-3 h-3 inline mr-1" />{service.duration} 分鐘</p>
                        </div>
                        <span className="font-bold text-emerald-700">HK$ {service.price}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl text-stone-500 text-sm">
                      單次基礎諮詢：HK$ {master.price}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* 底部懸浮收銀台 */}
        <div className="absolute bottom-0 w-full bg-white border-t border-stone-200 p-4 z-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-stone-500">線上諮詢起步價</p>
              <p className="text-xl font-bold text-stone-900">
                HK$ {master.services && master.services.length > 0 ? Math.min(...master.services.map((s: ServiceItem) => s.price)) : master.price}
              </p>
            </div>
            
            <button 
              disabled={!master.is_accepting_orders}
              onClick={() => setIsBookingModalOpen(true)}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
                master.is_accepting_orders 
                  ? 'bg-stone-900 text-stone-50 hover:bg-stone-800 active:scale-95' 
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {master.is_accepting_orders ? (
                <><Clock className="w-4 h-4" /> 查看檔期並預約</>
              ) : (
                '大師休息中'
              )}
            </button>
          </div>
        </div>

        {/* 實際處理結帳的 BookingModal */}
        {isBookingModalOpen && (
           <BookingModal 
             isOpen={isBookingModalOpen}
             onClose={() => setIsBookingModalOpen(false)}
             master={master} 
           />
        )}
      </div>
    </div>
  );
}