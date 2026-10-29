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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm transition-opacity">
      
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
        
        {/* 關閉按鈕 */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto pb-28 scrollbar-hide">
          
          {/* ✅ 全新設計：質感深色橫幅背景 (不再用大圖硬塞) */}
          <div className="relative h-32 w-full bg-gradient-to-r from-stone-800 to-stone-900">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
          </div>

          <div className="px-6 md:px-10 relative z-10">
            {/* ✅ 全新設計：獨立懸浮頭像，保證不被遮擋、比例完美 */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-12 sm:-mt-16 mb-8">
              
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-stone-100 flex items-center justify-center">
                  {master.imageUrl ? (
                    // 這裡改回 object-cover，但因為容器是正方形，所以裁切會非常自然好看
                    <img src={master.imageUrl} alt={master.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-stone-400 font-medium">無照片</span>
                  )}
                </div>
                
                {/* 狀態標籤掛在頭像右下角 */}
                <div className="absolute -bottom-2 -right-2">
                  {master.is_accepting_orders ? (
                    <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-sm border-2 border-white flex items-center gap-1">
                      <Power className="w-3 h-3"/> 接單中
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-stone-500 text-white rounded-lg text-[11px] font-bold shadow-sm border-2 border-white flex items-center gap-1">
                      <Power className="w-3 h-3"/> 休息中
                    </span>
                  )}
                </div>
              </div>

              {/* 導師名稱與評價 (與頭像並排) */}
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-3xl font-bold text-stone-900">{master.name}</h1>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    平台認證
                  </span>
                </div>
                <p className="text-sm text-stone-500 font-medium mb-3">{master.lineage}</p>
                
                <div className="flex items-center gap-4 text-sm">
                   <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4.5 h-4.5 fill-amber-500" />
                      <span className="font-bold text-stone-900 text-base">{master.rating}</span>
                   </div>
                   <span className="text-stone-300">|</span>
                   <span className="text-stone-500 font-medium">{master.reviews} 則真實評價</span>
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-4 border-t border-stone-100">
              
              {/* 擅長領域 */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" /> 擅長領域
                </h3>
                <div className="flex flex-wrap gap-2">
                  {master.tags?.map((item: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-medium hover:border-emerald-200 transition-colors">
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
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-emerald-600" /> 關於導師
                </h3>
                <p className="text-stone-600 text-[15px] leading-relaxed font-light whitespace-pre-wrap bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  {master.bio || '導師尚未提供詳細介紹。'}
                </p>
              </section>

              {/* 服務項目 */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" /> 服務項目
                </h3>
                <div className="space-y-3">
                  {master.services && master.services.length > 0 ? (
                    master.services.map((service: ServiceItem) => (
                      <div key={service.id} className="flex justify-between items-center p-5 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-emerald-400 hover:shadow-md transition-all">
                        <div>
                          <h4 className="font-bold text-stone-900">{service.name}</h4>
                          <p className="text-sm text-stone-500 mt-1.5"><Clock className="w-3.5 h-3.5 inline mr-1" />{service.duration} 分鐘</p>
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
        </div>

        {/* 底部懸浮收銀台 */}
        <div className="absolute bottom-0 w-full bg-white border-t border-stone-200 p-5 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
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
              className={`flex-1 py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base font-bold shadow-lg ${
                master.is_accepting_orders 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/25 active:scale-95' 
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