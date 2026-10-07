'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, CreditCard, ArrowLeft, Loader2, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // 確保路徑正確

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  master: any;
}

interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  isActive: boolean;
  slots: TimeSlot[];
}

type WeeklySchedule = Record<string, DaySchedule>;

const DAY_MAP: Record<number, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday'
};

export default function BookingModal({ isOpen, onClose, master }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(false); 
  
  const services: ServiceItem[] = master?.services || [];
  const schedule: WeeklySchedule | null = master?.schedule || null;
  const basePrice = master?.price || 0;
  const masterName = master?.name || '';

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // 回歸極簡：只收集姓名與電話
  const [clientData, setClientData] = useState({ name: '', phone: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime('');
        setClientData({ name: '', phone: '' });
        setIsSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  const availableDates = useMemo(() => {
    if (!schedule) return [];
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = DAY_MAP[d.getDay()];
      
      if (schedule[dayName] && schedule[dayName].isActive) {
        dates.push(d);
      }
    }
    return dates;
  }, [schedule]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !schedule || !selectedService) return [];
    
    const dayName = DAY_MAP[selectedDate.getDay()];
    const daySchedule = schedule[dayName];
    if (!daySchedule || !daySchedule.isActive) return [];

    const slots: string[] = [];
    const durationMins = selectedService.duration;

    const timeToMins = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    
    const minsToTime = (mins: number) => {
      const h = Math.floor(mins / 60).toString().padStart(2, '0');
      const m = (mins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    daySchedule.slots.forEach(slot => {
      let currentMins = timeToMins(slot.start);
      const endMins = timeToMins(slot.end);

      while (currentMins + durationMins <= endMins) {
        slots.push(minsToTime(currentMins));
        currentMins += durationMins; 
      }
    });

    return slots;
  }, [selectedDate, schedule, selectedService]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('orders').insert([{
        master_id: master.id,
        client_name: clientData.name,
        client_phone: clientData.phone, // 將寫入 Supabase 新增的 client_phone 欄位
        service_name: selectedService?.name,
        price: selectedService?.price,
        appointment_date: selectedDate?.toISOString().split('T')[0],
        appointment_time: selectedTime,
        status: 'pending'
        // birth_data 與 client_gender 皆留空，後續大師手動補上
      }]);

      if (error) throw error;
      setIsSuccess(true);
    } catch (err) {
      alert('預約失敗，請檢查網路連線或稍後再試。');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 md:p-4 transition-all">
      <div className="bg-white w-full md:w-[500px] h-[85vh] md:h-auto md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 duration-300">
        
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && !isSuccess && (
              <button onClick={() => setStep(step - 1)} className="p-1 -ml-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="font-bold text-stone-900">預約 {masterName}</h2>
              {!isSuccess && (
                <p className="text-xs text-stone-500 font-medium tracking-wide">
                  步驟 {step} / 3：{step === 1 ? '選擇服務' : step === 2 ? '選擇檔期' : '確認預約'}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {loadingData ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">正在讀取大師即時檔期...</p>
            </div>
          ) : isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900">預約申請已送出！</h3>
              <p className="text-stone-500 text-sm max-w-[250px]">
                我們已收到您預約 {masterName} 的申請，大師確認後將會透過手機與您聯繫。
              </p>
              <div className="w-full bg-white border border-stone-100 rounded-2xl p-4 mt-6 text-left space-y-2 text-sm shadow-sm">
                <div className="flex justify-between"><span className="text-stone-500">服務</span><span className="font-medium text-stone-900">{selectedService?.name}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">日期</span><span className="font-medium text-stone-900">{selectedDate?.toLocaleDateString('zh-TW')}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">時間</span><span className="font-medium text-stone-900">{selectedTime}</span></div>
                <div className="pt-2 mt-2 border-t border-stone-100 flex justify-between"><span className="text-stone-500">總金額</span><span className="font-bold text-emerald-700">HK$ {selectedService?.price}</span></div>
              </div>
              <button onClick={onClose} className="w-full py-4 mt-4 bg-stone-900 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors">
                完成並關閉
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="font-medium text-stone-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600"/> 請選擇您需要的服務
                  </h3>
                  
                  {services.length > 0 ? (
                    services.map(service => (
                      <div 
                        key={service.id}
                        onClick={() => { setSelectedService(service); setStep(2); }}
                        className="p-4 bg-white border border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-stone-900 text-lg">{service.name}</h4>
                          <span className="font-bold text-emerald-700">HK$ {service.price}</span>
                        </div>
                        <p className="text-sm text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {service.duration} 分鐘
                        </p>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                          <ChevronRight className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div 
                      onClick={() => { 
                        setSelectedService({ id: 'default', name: '單次諮詢', duration: 60, price: basePrice }); 
                        setStep(2); 
                      }}
                      className="p-4 bg-white border border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-stone-900 text-lg">標準單次諮詢</h4>
                        <span className="font-bold text-emerald-700">HK$ {basePrice}</span>
                      </div>
                      <p className="text-sm text-stone-500">60 分鐘</p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium flex justify-between items-center border border-emerald-100">
                    <span>已選擇：{selectedService?.name}</span>
                    <span>HK$ {selectedService?.price}</span>
                  </div>

                  <div>
                    <h3 className="font-medium text-stone-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600"/> 選擇日期 (未來 30 天)
                    </h3>
                    {availableDates.length > 0 ? (
                      <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide">
                        {availableDates.map((date, i) => {
                          const isSelected = selectedDate?.getTime() === date.getTime();
                          return (
                            <div 
                              key={i}
                              onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                              className={`shrink-0 snap-start w-20 py-3 rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                                isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-105' : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-400'
                              }`}
                            >
                              <span className="text-xs font-medium mb-1 opacity-80">{date.toLocaleDateString('zh-TW', { weekday: 'short' })}</span>
                              <span className="text-xl font-bold">{date.getDate()}</span>
                              <span className="text-[10px] uppercase mt-1 opacity-80">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-100 text-center">
                        大師近期沒有設定可預約的排班檔期。
                      </div>
                    )}
                  </div>

                  {selectedDate && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <h3 className="font-medium text-stone-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600"/> 選擇時段
                      </h3>
                      {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {availableTimeSlots.map((time, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                selectedTime === time 
                                ? 'bg-stone-900 border-stone-900 text-white shadow-md transform scale-105' 
                                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-stone-100 text-stone-500 rounded-xl text-sm text-center">
                          這一天大師的時段無法容納該服務時長，請選擇其他日期。
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <form onSubmit={handleConfirmBooking} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm space-y-3">
                    <h3 className="font-bold text-stone-900 border-b border-stone-100 pb-2 mb-3">訂單摘要</h3>
                    <div className="flex justify-between items-center text-sm"><span className="text-stone-500">大師</span><span className="font-medium text-stone-900">{masterName}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-stone-500">服務</span><span className="font-medium text-stone-900">{selectedService?.name}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-stone-500">時間</span><span className="font-medium text-emerald-700">{selectedDate?.toLocaleDateString('zh-TW')} {selectedTime}</span></div>
                    <div className="pt-3 mt-1 border-t border-stone-100 flex justify-between items-center"><span className="font-medium text-stone-700">總結帳金額</span><span className="text-xl font-bold text-stone-900">HK$ {selectedService?.price}</span></div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">您的姓名</label>
                      <input type="text" required value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20" placeholder="例如：陳大文" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">聯絡電話 (WhatsApp)</label>
                      <input type="tel" required value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20" placeholder="大師將以此號碼與您聯繫" />
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {!loadingData && !isSuccess && (
          <div className="p-4 bg-white border-t border-stone-100 shrink-0">
            {step === 1 ? (
              <p className="text-center text-xs text-stone-400 font-light pb-2">請點擊上方服務卡片以進入下一步</p>
            ) : step === 2 ? (
              <button 
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className={`w-full py-4 rounded-xl font-medium transition-all ${
                  selectedDate && selectedTime 
                  ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg active:scale-95' 
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                確認時段並填寫資料
              </button>
            ) : (
              <button 
                onClick={handleConfirmBooking}
                disabled={isSubmitting || !clientData.name || !clientData.phone}
                className={`w-full py-4 flex items-center justify-center gap-2 rounded-xl font-medium transition-all ${
                  !clientData.name || !clientData.phone 
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95'
                }`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {isSubmitting ? '處理中...' : '確認預約送出'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}