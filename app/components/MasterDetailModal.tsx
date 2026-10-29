'use client';

import React from 'react';
import { X, Star, ShieldCheck, ScrollText, Sparkles, Clock, CreditCard, Power } from 'lucide-react';
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-stone-900/70 backdrop-blur-sm transition-opacity">
      
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* 極簡白底彈出視窗 */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden border border-stone-100">
        
        {/* 懸浮關閉按鈕 */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 rounded-full backdrop-blur-md transition-colors shadow-sm border border-stone-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide p-6 sm:p-8">
          
          {/* ✅ 極簡圖片區塊：不再做滿版，而是作為內文的一部分 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
            <div className="relative shrink-0 w-32 h-32 sm:w-40 sm:h-40">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                {master.imageUrl ? (
                  <img src={master.imageUrl} alt={master.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 font-medium">無照片</div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2">
                  {master.is_accepting_orders ? (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold shadow-sm border border-emerald-200 flex items-center gap-1">
                      <Power className="w-3 h-3"/> 接單中
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold shadow-sm border border-stone-200 flex items-center gap-1">
                      <Power className="w-3 h-3"/> 休息中
                    </span>
                  )}
              </div>
            </div>

            {/* 標題與簡介 */}
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-stone-900">{master.name}</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  平台認證
                </span>
              </div>
              <p className="text-base text-stone-600 font-medium mb-4">{master.lineage}</p>
              
              <div className="flex items-center gap-4 text-sm bg-stone-50 inline-flex px-4 py-2 rounded-xl border border-stone-100">
                 <div className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4.5 h-4.5 fill-amber-500" />
                    <span className="font-bold text-stone-900 text-base">{master.rating}</span>
                 </div>
                 <span className="text-stone-300">|</span>
                 <span className="text-stone-600 font-medium">{master.reviews} 則真實評價</span>
              </div>
            </div>
          </div>

          <div className="space-y-10 border-t border-stone-100 pt-8">
            
            {/* 擅長領域 */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-stone-400" /> 擅長領域
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {master.tags?.map((item: string, index: number) => (
                  <span key={index} className="px-4 py-2 bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-sm font-medium">
                    #{item}
                  </span>
                ))}
                {(!master.tags || master.tags.length === 0) && (
                  <span className="text-sm text-stone-400 font-light">尚未新增標籤</span>
                )}
              </div>
            </section>

            {/* 關於導師 */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-stone-400" /> 關於導師
              </h3>
              <div className="prose prose-stone max-w-none text-[15px] leading-relaxed font-light whitespace-pre-wrap text-stone-600">
                {master.bio || '導師尚未提供詳細介紹。'}
              </div>
            </section>

            {/* 服務項目 */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-stone-400" /> 服務項目
              </h3>
              <div className="grid gap-3">
                {master.services && master.services.length > 0 ? (
                  master.services.map((service: ServiceItem) => (
                    <div key={service.id} className="flex justify-between items-center p-5 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
                      <div>
                        <h4 className="font-bold text-stone-900">{service.name}</h4>
                        <p className="text-sm text-stone-500 mt-1.5"><Clock className="w-4 h-4 inline mr-1" />{service.duration} 分鐘</p>
                      </div>
                      <span className="font-bold text-emerald-700 text-xl">HK$ {service.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-5 bg-stone-50 border border-stone-100 rounded-2xl text-stone-500 text-sm font-medium">
                    單次基礎諮詢：HK$ {master.price}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* 底部懸浮收銀台 */}
        <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-stone-200 p-5 sm:px-8 z-50">
          <div className="flex justify-between items-center gap-6">
            <div>
              <p className="text-xs text-stone-500 font-medium mb-0.5">線上諮詢起步價</p>
              <p className="text-3xl font-bold text-stone-900 tracking-tight">
                <span className="text-base font-medium text-stone-500 mr-1">HK$</span>
                {master.services && master.services.length > 0 ? Math.min(...master.services.map((s: ServiceItem) => s.price)) : master.price}
              </p>
            </div>
            
            <button 
              disabled={!master.is_accepting_orders}
              onClick={() => setIsBookingModalOpen(true)}
              className={`flex-1 py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base font-bold ${
                master.is_accepting_orders 
                  ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-xl shadow-stone-900/10 active:scale-95' 
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none'
              }`}
            >
              {master.is_accepting_orders ? (
                '查看檔期並預約'
              ) : (
                '大師休息中'
              )}
            </button>
          </div>
        </div>

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