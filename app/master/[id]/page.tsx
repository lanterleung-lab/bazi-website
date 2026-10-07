'use client';

import React, { useState, useEffect, use } from 'react';
import { Star, ShieldCheck, ScrollText, Sparkles, ArrowLeft, Clock, CreditCard, Power } from 'lucide-react';
import BookingModal from '../../components/BookingModal';
import BaziCalculator from '../../components/BaziCalculator';
import { supabase } from '../../../lib/supabase';

// 定義服務項目的介面
interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export default function MasterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [master, setMaster] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMasterDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('masters')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setMaster({
            id: data.id,
            name: data.name,
            lineage: data.lineage,
            tags: data.tags || [],
            price: data.price,
            rating: 5.0,
            reviews: 128,
            imageUrl: data.image_url,
            bio: data.bio || '專屬命理導師，為您提供專業諮詢。',
            services: data.services || [],
            is_accepting_orders: data.is_accepting_orders ?? true,
            schedule: data.schedule,  // 👈 就是漏了這一行！把排班表存進去
            recentReviews: [
              { id: 1, user: '陳**', text: '大師一語道破我的困境，非常精準！', date: '2023-10-12' },
              { id: 2, user: '林**', text: '非常有耐心，讓人感到安心。', date: '2023-10-05' }
            ]
          });
        }
      } catch (error) {
        console.error('抓取大師資料失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center font-sans">
        <p className="text-stone-500 animate-pulse">正在為您請出大師資料...</p>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans space-y-4">
        <p className="text-xl text-stone-800">查無此大師</p>
        <a href="/" className="text-emerald-700 hover:underline">返回大師名冊</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-24">
      <nav className="absolute top-0 w-full p-6 z-10 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 text-stone-50 bg-stone-900/40 backdrop-blur-md px-4 py-2 rounded-full hover:bg-stone-900/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">返回大師名冊</span>
        </a>
      </nav>

      {/* 頂部大圖區塊 */}
      <div className="relative h-[50vh] w-full bg-stone-900">
        {master.imageUrl ? (
           <img src={master.imageUrl} alt={master.name} className="w-full h-full object-cover opacity-80" />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-stone-500">無照片</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-stone-50/20 to-transparent" />
        
        <div className="absolute top-6 right-6 z-10">
          {master.is_accepting_orders ? (
            <span className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm text-white rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm"><Power className="w-4 h-4"/> 接單中</span>
          ) : (
            <span className="px-3 py-1.5 bg-stone-800/80 backdrop-blur-sm text-white rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm"><Power className="w-4 h-4"/> 休息中</span>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-32 relative z-10 space-y-8">
        
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-semibold text-stone-900">{master.name}</h1>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3" />
                平台認證
              </span>
            </div>
            <p className="text-lg text-stone-500 font-light">{master.lineage}</p>
          </div>
          
          <div className="flex gap-6 text-center divide-x divide-stone-100">
            <div className="pr-6">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                <Star className="w-5 h-5 fill-amber-500" />
                <span className="text-2xl font-bold text-stone-900">{master.rating}</span>
              </div>
              <p className="text-xs text-stone-400">{master.reviews} 則評價</p>
            </div>
            <div className="pl-6">
              <p className="text-xs text-stone-400 mb-1">
                {master.services && master.services.length > 0 ? '最低起' : '單次諮詢'}
              </p>
              <p className="text-2xl font-bold text-emerald-800">HK$ {master.price}</p>
            </div>
          </div>
        </div>

        {/* 🌟 植入共用的排盤與雷達圖工具 */}
        <div className="w-full">
          <BaziCalculator 
            onActionClick={() => {
              if(master.is_accepting_orders) setIsModalOpen(true);
            }} 
            actionText={master.is_accepting_orders ? "立即預約大師為您解盤" : "大師目前休息中"} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            
            <section className="space-y-4">
              <h3 className="text-xl font-medium text-stone-900 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-stone-400" />
                大師簡介
              </h3>
              <p className="text-stone-600 leading-relaxed font-light whitespace-pre-wrap">
                {master.bio}
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-medium text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-stone-400" />
                擅長領域
              </h3>
              <div className="flex flex-wrap gap-2">
                {master.tags.map((item: string, index: number) => (
                  <span key={index} className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm">
                    #{item}
                  </span>
                ))}
                {master.tags.length === 0 && <span className="text-sm text-stone-400 font-light">尚未新增標籤</span>}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-medium text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-stone-400" />
                服務項目與報價
              </h3>
              <div className="space-y-3">
                {master.services && master.services.length > 0 ? (
                  master.services.map((service: ServiceItem) => (
                    <div key={service.id} className="flex justify-between items-center p-4 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <h4 className="font-medium text-stone-900">{service.name}</h4>
                        <p className="text-sm text-stone-500 mt-0.5"><Clock className="w-3 h-3 inline mr-1" />{service.duration} 分鐘</p>
                      </div>
                      <span className="text-lg font-bold text-emerald-700">HK$ {service.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl text-center text-stone-500 text-sm">
                    此大師提供基礎單次諮詢服務，費用為 HK$ {master.price}。
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-medium text-stone-900">真實結緣回饋</h3>
            <div className="space-y-4">
              {master.recentReviews.map((review: any) => (
                <div key={review.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-stone-800">{review.user}</span>
                    <span className="text-xs text-stone-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-stone-600 font-light">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 底部懸浮收銀台列 */}
      <div className="fixed bottom-0 w-full bg-white border-t border-stone-200 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-stone-500">線上 1 對 1 諮詢</p>
            <p className="text-lg font-bold text-stone-900">
              HK$ {master.services && master.services.length > 0 ? Math.min(...master.services.map((s: ServiceItem) => s.price)) : master.price}
              <span className="text-sm font-normal text-stone-500 ml-1">起</span>
            </p>
          </div>
          
          <button 
            disabled={!master.is_accepting_orders}
            onClick={() => setIsModalOpen(true)}
            className={`px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 font-medium ${
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

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        master={master}
      />
    </div>
  );
}