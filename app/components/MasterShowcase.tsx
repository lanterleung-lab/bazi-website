'use client';

import React, { useState, useEffect } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase'; 
import BookingModal from './BookingModal'; // 引入預約彈窗

// ==========================================
// 1. TypeScript 介面定義
// ==========================================
type DomainType = 'ALL' | 'BAZI' | 'ZIWEI' | 'TAROT' | 'CHANNELING';

interface Master {
  id: string;
  name: string;
  lineage: string;
  domain: DomainType;
  tags: string[];
  price: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  // 新增：把 schedule 等其他詳細資料也抓下來給 Modal 用
  bio?: string;
  services?: any[];
  schedule?: any;
}

// ==========================================
// 2. 核心組件：大師展示櫥窗
// ==========================================
export default function MasterShowcase() {
  const [activeDomain, setActiveDomain] = useState<DomainType>('ALL');
  const [masters, setMasters] = useState<Master[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 控制預約彈窗的狀態
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        // 確保抓取 is_accepting_orders 為 true 的大師
        const { data, error } = await supabase
          .from('masters')
          .select('*')
          .eq('is_accepting_orders', true);
        
        if (error) throw error;

        if (data) {
          const formattedData = data.map((dbMaster) => ({
            id: dbMaster.id,
            name: dbMaster.name,
            lineage: dbMaster.lineage,
            domain: dbMaster.domain,
            tags: dbMaster.tags,
            price: dbMaster.price,
            rating: dbMaster.rating || 5.0,
            reviews: dbMaster.reviews || 0,
            imageUrl: dbMaster.image_url,
            bio: dbMaster.bio,
            services: dbMaster.services,
            schedule: dbMaster.schedule,
          }));
          setMasters(formattedData);
        }
      } catch (error) {
        console.error('抓取大師資料失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasters();
  }, []);

  const filters = [
    { label: '全部大師', value: 'ALL' },
    { label: '子平八字', value: 'BAZI' },
    { label: '紫微斗數', value: 'ZIWEI' },
    { label: '塔羅占卜', value: 'TAROT' },
    { label: '靈媒通靈', value: 'CHANNELING' },
    { label: '心理諮詢', value: 'COUNSELING' },
  ];

  const filteredMasters = masters.filter(
    (master) => activeDomain === 'ALL' || master.domain === activeDomain
  );

  const handleOpenBooking = (master: Master) => {
    setSelectedMaster(master);
    setIsBookingModalOpen(true);
  };

  return (
    <section className="min-h-screen bg-stone-50 py-20 px-6 sm:px-12 lg:px-24 font-sans relative z-10">
      
      <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
        <h2 className="text-sm font-medium tracking-widest text-emerald-800 uppercase">
          Curated Masters
        </h2>
        <h1 className="text-4xl md:text-5xl font-light text-stone-900 tracking-wide">
          結緣您的專屬命理導師
        </h1>
        <p className="text-stone-500 text-lg md:text-xl font-light max-w-2xl mx-auto">
          嚴格甄選各領域頂尖人士，為您的事業、姻緣與人生抉擇提供精準指引。
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveDomain(filter.value as DomainType)}
            className={`px-6 py-2.5 rounded-full text-sm transition-all duration-300 ease-out border ${
              activeDomain === filter.value
                ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-md'
                : 'bg-transparent text-stone-600 border-stone-300 hover:border-stone-900 hover:text-stone-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-stone-500 animate-pulse">
          正在從雲端請出大師名冊，請稍候...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredMasters.map((master) => (
              <div 
                key={master.id}
                onClick={() => handleOpenBooking(master)}
                className="group block bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative h-72 w-full overflow-hidden bg-stone-200">
                  <img
                    src={master.imageUrl || 'https://via.placeholder.com/400x500'}
                    alt={master.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out grayscale-[20%] group-hover:grayscale-0"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-stone-800">{master.rating}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-medium text-stone-900">{master.name}</h3>
                      <p className="text-sm text-stone-500 mt-1">{master.lineage}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-stone-400 block">單次諮詢</span>
                      <span className="text-lg font-semibold text-emerald-800">HK$ {master.price}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {master.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 text-xs text-stone-600 bg-stone-100 rounded-md flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-stone-400" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="w-full mt-4 py-3 bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 transition-all flex justify-center items-center gap-2 font-medium">
                    立即預約諮詢
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredMasters.length === 0 && (
            <div className="text-center py-20 text-stone-500">
              目前該流派暫無入駐大師，敬請期待。
            </div>
          )}
        </>
      )}

      {/* 掛載預約彈窗 */}
      {isBookingModalOpen && selectedMaster && (
        <BookingModal 
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          master={selectedMaster}
        />
      )}
    </section>
  );
}