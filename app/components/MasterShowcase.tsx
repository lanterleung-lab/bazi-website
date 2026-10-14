'use client';

import React, { useState, useEffect } from 'react';
import { Star, Sparkles, X } from 'lucide-react';
import { supabase } from '../../lib/supabase'; 
import BookingModal from './BookingModal';

type DomainType = 'ALL' | 'BAZI' | 'ZIWEI' | 'TAROT' | 'CHANNELING' | 'COUNSELING';

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
  bio?: string;
  services?: any[];
  schedule?: any;
}

// 🌟 讓首頁可以傳遞屬性進來的介面
interface MasterShowcaseProps {
  externalFilter?: string;
  onClearFilter?: () => void;
}

export default function MasterShowcase({ externalFilter = 'ALL', onClearFilter }: MasterShowcaseProps) {
  const [activeDomain, setActiveDomain] = useState<DomainType>('ALL');
  const [masters, setMasters] = useState<Master[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const { data, error } = await supabase.from('masters').select('*').eq('is_accepting_orders', true);
        if (error) throw error;
        if (data) {
          const formattedData = data.map((dbMaster) => ({
            id: dbMaster.id,
            name: dbMaster.name,
            lineage: dbMaster.lineage,
            domain: dbMaster.domain,
            tags: dbMaster.tags || [],
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

  // 🧠 智能關鍵字引擎
  const getSearchKeywords = (filter: string) => {
    switch(filter) {
      case '感情': return ['感情', '姻緣', '戀愛', '桃花', '愛情', '婚姻', '復合'];
      case '事業': return ['事業', '財運', '工作', '升職', '創業', '投資', '職場'];
      case '迷惘': return ['迷惘', '流年', '運勢', '抉擇', '人生', '命運', '八字', '紫微'];
      case '療癒': return ['療癒', '心理', '塔羅', 'oh卡', '潛意識', '諮商', '諮詢'];
      case '八字': return ['八字', '子平'];
      case '塔羅': return ['塔羅', 'tarot'];
      case '靈數': return ['靈數', '生命', '數字'];
      default: return [filter];
    }
  };

  const filteredMasters = masters.filter((master) => {
    const matchDomain = activeDomain === 'ALL' || master.domain === activeDomain;
    
    let matchTopic = true;
    if (externalFilter !== 'ALL') {
      const keywords = getSearchKeywords(externalFilter);
      const contentToSearch = [master.name, master.lineage, master.bio || '', ...master.tags].join(' ').toLowerCase();
      matchTopic = keywords.some(kw => contentToSearch.includes(kw.toLowerCase()));
    }
    
    return matchDomain && matchTopic;
  });

  const handleOpenBooking = (master: Master) => {
    setSelectedMaster(master);
    setIsBookingModalOpen(true);
  };

  return (
    <section className="min-h-screen bg-stone-50 py-20 px-6 sm:px-12 lg:px-24 font-sans relative z-10">
      
      <div className="max-w-4xl mx-auto text-center mb-10 space-y-4">
        <h2 className="text-sm font-medium tracking-widest text-emerald-800 uppercase">Curated Masters</h2>
        <h1 className="text-4xl md:text-5xl font-light text-stone-900 tracking-wide">結緣您的專屬命理導師</h1>
      </div>

      {externalFilter !== 'ALL' && (
        <div className="max-w-3xl mx-auto mb-10 flex justify-center animate-in fade-in zoom-in duration-300">
           <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-2.5 rounded-full flex items-center gap-3 shadow-sm text-sm">
              <span className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> 正在為您推薦專精【{externalFilter}】領域的大師
              </span>
              <button onClick={onClearFilter} className="bg-white hover:bg-emerald-100 text-emerald-600 p-1 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

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
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out grayscale-[10%] group-hover:grayscale-0"
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
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {master.tags.slice(0, 4).map((tag, index) => (
                      <span key={index} className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${
                        externalFilter !== 'ALL' && getSearchKeywords(externalFilter).some(kw => tag.includes(kw))
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium'
                        : 'bg-stone-100 text-stone-600'
                      }`}>
                        <Sparkles className="w-3 h-3 opacity-50" /> {tag}
                      </span>
                    ))}
                  </div>

                  <div className="w-full mt-4 py-3 bg-stone-900 text-stone-50 rounded-xl group-hover:bg-stone-800 transition-all flex justify-center items-center font-medium">
                    查看詳情與預約
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredMasters.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-4 rounded-full bg-stone-100 mb-4 text-stone-400"><Sparkles className="w-8 h-8" /></div>
              <p className="text-stone-500 text-lg">目前尚無符合該條件的大師</p>
              <button onClick={onClearFilter} className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
                查看所有大師陣容
              </button>
            </div>
          )}
        </>
      )}

      {isBookingModalOpen && selectedMaster && (
        <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} master={selectedMaster} />
      )}
    </section>
  );
}