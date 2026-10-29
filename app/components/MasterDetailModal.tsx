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
    // ✅ 恢復為：背景全螢幕，內容「置中」對齊
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity">
      
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* ✅ 恢復為：置中大圓角卡片 (max-w-2xl, max-h-[85vh], rounded-3xl)，並帶有從中央放大的動畫 (zoom-in-95) */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-stone-50 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto pb-28 scrollbar-hide">
          
          {/* ✅ 修復圖片：改回原本的高度 (h-64)，拿掉害人的 object-top，讓它自然置中裁切 */}
          <div className="relative h-64 w-full bg-white">
            {master.imageUrl ? (
               <img src={master.imageUrl} alt={master.name} className="w-full h-full object-cover object-center" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-stone-400 font-medium">無照片</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-transparent" />
            
            <div className="absolute top-4 left-4 z-10">
              {master.is_accepting_orders ? (
                <span className="px-3 py-1.5 bg-emerald-500/95 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"><Power className="w-3.5 h-3.5"/> 接單中</span>
              ) : (
                <span className="px-3 py-1.5 bg-stone-800/90 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"><Power className="w-3.5 h-3.5"/> 休息中</span>
              )}
            </div>
          </div>

          <div className="px-6 md:px-10 -mt-10 relative z-10 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-stone-900">{master.name}</h1>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    平台認證
                  </span>
                </div>
                <p className="text-sm text-stone-500 font-medium">{master.lineage}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm mt-2">
                 <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="font-bold text-stone-900">{master.rating}</span>
                 </div>
                 <span className="text-stone-300">|</span>
                 <span className="text-stone-500 font-medium">{master.reviews} 則真實評價</span>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* ✅ 保留你要求的順序：「擅長領域」在前面 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> 擅長領域
                </h3>
                <div className="flex flex-wrap gap-2">
                  {master.tags?.map((item: string, index: number) => (
                    <span key={index} className="px-3 py-1.5 bg-stone-100/80 text-stone-700 border border-stone-200 rounded-lg text-xs font-medium">
                      #{item}
                    </span>
                  ))}
                  {(!master.tags || master.tags.length === 0) && (
                    <span className="text-sm text-stone-400 font-light">尚未新增標籤</span>
                  )}
                </div>
              </section>

              {/* ✅ 保留你要求的順序：「關於導師」在後面 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-emerald-600" /> 關於導師
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light whitespace-pre-wrap bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
                  {master.bio || '導師尚未提供詳細介紹。'}
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> 服務項目
                </h3>
                <div className="space-y-3">
                  {master.services && master.services.length > 0 ? (
                    master.services.map((service: ServiceItem) => (
                      <div key={service.id} className="flex justify-between items-center p-4 bg-white border border-stone-100 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors">
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm">{service.name}</h4>
                          <p className="text-xs text-stone-500 mt-1"><Clock className="w-3 h-3 inline mr-1" />{service.duration} 分鐘</p>
                        </div>
                        <span className="font-bold text-emerald-700 text-lg">HK$ {service.price}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-500 text-sm font-medium">
                      單次基礎諮詢：HK$ {master.price}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full bg-white border-t border-stone-200 p-5 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center gap-4">
            <div>
              <p className="text-xs text-stone-500 font-medium">線上諮詢起步價</p>
              <p className="text-2xl font-bold text-stone-900">
                <span className="text-sm font-medium text-stone-500 mr-1">HK$</span>
                {master.services && master.services.length > 0 ? Math.min(...master.services.map((s: ServiceItem) => s.price)) : master.price}
              </p>
            </div>
            
            <button 
              disabled={!master.is_accepting_orders}
              onClick={() => setIsBookingModalOpen(true)}
              className={`flex-1 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-lg ${
                master.is_accepting_orders 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20 active:scale-95' 
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