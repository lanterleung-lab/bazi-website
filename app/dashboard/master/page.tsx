'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Cropper from 'react-easy-crop';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Solar } from 'lunar-javascript';
import { 
  Save, Sparkles, LogOut, UploadCloud, Loader2, Hash, X, 
  LayoutDashboard, CreditCard, CalendarDays, Eye, ShieldCheck, Star, Plus, Trash2, Clock, ScrollText, Check,
  ClipboardList, UserSearch, CalendarClock, Phone, Edit3
} from 'lucide-react';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg'));
}

interface ServiceItem { id: string; name: string; duration: number; price: number; }
interface TimeSlot { start: string; end: string; }
interface DaySchedule { isActive: boolean; slots: TimeSlot[]; }
type WeeklySchedule = Record<string, DaySchedule>;

const defaultSchedule: WeeklySchedule = {
  monday: { isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
  tuesday: { isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
  wednesday: { isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
  thursday: { isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
  friday: { isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
  saturday: { isActive: false, slots: [{ start: '10:00', end: '18:00' }] },
  sunday: { isActive: false, slots: [{ start: '10:00', end: '18:00' }] },
};

const DAYS_OF_WEEK = [
  { key: 'monday', label: '星期一' }, { key: 'tuesday', label: '星期二' }, { key: 'wednesday', label: '星期三' },
  { key: 'thursday', label: '星期四' }, { key: 'friday', label: '星期五' }, { key: 'saturday', label: '星期六' }, { key: 'sunday', label: '星期日' },
];

export default function MasterDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); 
  const [tagInput, setTagInput] = useState('');
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [calculatedBazi, setCalculatedBazi] = useState<any>(null);

  // 補登八字專用的狀態
  const [enrichModalOpen, setEnrichModalOpen] = useState(false);
  const [enrichData, setEnrichData] = useState({ orderId: '', clientName: '', gender: 'F', birthDate: '', birthTime: '12:00' });
  const [enriching, setEnriching] = useState(false);

  const [masterData, setMasterData] = useState({
    id: '', name: '', lineage: '', bio: '', price: 0, image_url: '',
    tags: [] as string[], services: [] as ServiceItem[], is_accepting_orders: true, schedule: defaultSchedule as WeeklySchedule, 
  });

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) return router.push('/login');
        
        const { data: masterProfile, error: profileError } = await supabase
          .from('masters').select('*').eq('email', authData.user.email).single();

        if (profileError) throw profileError;
        
        if (masterProfile) {
          const dbSchedule = masterProfile.schedule && Object.keys(masterProfile.schedule).length > 0 ? masterProfile.schedule : defaultSchedule;
          setMasterData({
            ...masterProfile,
            bio: masterProfile.bio || '', 
            tags: masterProfile.tags || [], services: masterProfile.services || [],
            is_accepting_orders: masterProfile.is_accepting_orders ?? true, schedule: dbSchedule
          });

          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('master_id', masterProfile.id)
            .order('created_at', { ascending: false });

          if (ordersData && ordersData.length > 0) {
            const formattedOrders = ordersData.map(o => ({
              id: o.id,
              clientName: o.client_name,
              clientPhone: o.client_phone,
              clientGender: o.client_gender,
              birthData: o.birth_data, 
              serviceName: o.service_name,
              date: o.appointment_date,
              time: o.appointment_time,
              status: o.status,
              price: o.price
            }));
            setOrders(formattedOrders);
          }
        }
      } catch (error) { console.error('載入資料失敗:', error); } finally { setLoading(false); }
    };
    checkAuthAndFetchData();
  }, [router]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('更新狀態失敗:', err);
      alert('更新狀態失敗');
    }
  };

  // --- 送出補登資料的邏輯 ---
  const handleEnrichSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnriching(true);
    try {
      const [year, month, day] = enrichData.birthDate.split('-');
      
      // 更新資料庫
      const { error } = await supabase.from('orders').update({
        client_gender: enrichData.gender,
        birth_data: { 
          year: parseInt(year), 
          month: parseInt(month), 
          day: parseInt(day), 
          time: enrichData.birthTime 
        }
      }).eq('id', enrichData.orderId);

      if (error) throw error;

      // 實時更新前端畫面，戰情室按鈕會瞬間解鎖
      setOrders(orders.map(o => o.id === enrichData.orderId ? {
        ...o,
        clientGender: enrichData.gender,
        birthData: { year: parseInt(year), month: parseInt(month), day: parseInt(day), time: enrichData.birthTime }
      } : o));

      setEnrichModalOpen(false);
    } catch (err) {
      console.error('補登失敗', err);
      alert('補登失敗，請稍後再試。');
    } finally {
      setEnriching(false);
    }
  };

  const handleOpenClientChart = (order: any) => {
    const { year, month, day, time } = order.birthData;
    const [hour, minute] = time.split(':').map(Number);
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const baZi = lunar.getEightChar();

    const baziResult = [
      { pillar: '年柱', stem: baZi.getYearGan(), stemElement: baZi.getYearWuXing().charAt(0), branch: baZi.getYearZhi(), branchElement: baZi.getYearWuXing().charAt(1), hiddenStems: baZi.getYearHideGan() },
      { pillar: '月柱', stem: baZi.getMonthGan(), stemElement: baZi.getMonthWuXing().charAt(0), branch: baZi.getMonthZhi(), branchElement: baZi.getMonthWuXing().charAt(1), hiddenStems: baZi.getMonthHideGan() },
      { pillar: '日柱', stem: baZi.getDayGan(), stemElement: baZi.getDayWuXing().charAt(0), branch: baZi.getDayZhi(), branchElement: baZi.getDayWuXing().charAt(1), hiddenStems: baZi.getDayHideGan() },
      { pillar: '時柱', stem: baZi.getTimeGan(), stemElement: baZi.getTimeWuXing().charAt(0), branch: baZi.getTimeZhi(), branchElement: baZi.getTimeWuXing().charAt(1), hiddenStems: baZi.getTimeHideGan() },
    ];

    let elementsCount = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    baziResult.forEach(pillar => {
      if (pillar.stemElement) elementsCount[pillar.stemElement as keyof typeof elementsCount] += 1;
      if (pillar.branchElement) elementsCount[pillar.branchElement as keyof typeof elementsCount] += 1;
    });

    const chartData = [
      { subject: '金', A: 20 + (elementsCount['金'] * 15), fullMark: 100 },
      { subject: '木', A: 20 + (elementsCount['木'] * 15), fullMark: 100 },
      { subject: '水', A: 20 + (elementsCount['水'] * 15), fullMark: 100 },
      { subject: '火', A: 20 + (elementsCount['火'] * 15), fullMark: 100 },
      { subject: '土', A: 20 + (elementsCount['土'] * 15), fullMark: 100 },
    ];

    setCalculatedBazi({ baziResult, chartData });
    setSelectedOrder(order);
  };

  const getElementColor = (element: string) => {
    switch(element) {
      case '木': return 'text-emerald-500'; case '火': return 'text-rose-500'; case '土': return 'text-amber-500'; case '金': return 'text-yellow-500'; case '水': return 'text-cyan-500'; default: return 'text-stone-400';
    }
  };

  const renderCustomTick = ({ payload, x, y }: any) => (
    <text x={x} y={y} textAnchor="middle" fill="#78716c" fontSize={12} fontWeight={500} className="font-serif">{payload.value}</text>
  );

  const handleAddTag = () => {
    const trimmedInput = tagInput.trim();
    if (trimmedInput && !masterData.tags.includes(trimmedInput)) {
      setMasterData({ ...masterData, tags: [...masterData.tags, trimmedInput] });
      setTagInput('');
    }
  };
  const handleRemoveTag = (indexToRemove: number) => setMasterData({ ...masterData, tags: masterData.tags.filter((_, index) => index !== indexToRemove) });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setImageSrc(reader.result as string); setCropModalOpen(true); });
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setUploadingImage(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error('裁切失敗');
      const fileName = `${masterData.id}-${Math.random()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, croppedBlob);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setMasterData({ ...masterData, image_url: data.publicUrl });
      setCropModalOpen(false); 
    } catch (error) { alert('上傳失敗，請稍後再試。'); } finally { setUploadingImage(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('masters').update({
        name: masterData.name, lineage: masterData.lineage, bio: masterData.bio,
        price: masterData.services.length > 0 ? Math.min(...masterData.services.map(s => s.price)) : masterData.price, 
        image_url: masterData.image_url, tags: masterData.tags, services: masterData.services,
        is_accepting_orders: masterData.is_accepting_orders, schedule: masterData.schedule 
      }).eq('id', masterData.id);
      if (error) throw error;
      alert('🎉 變更已成功實時發布！');
    } catch (error) { alert('儲存失敗，請稍後再試'); } finally { setSaving(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const handleAddService = () => setMasterData({ ...masterData, services: [...masterData.services, { id: Math.random().toString(36).substr(2, 9), name: '', duration: 30, price: 0 }] });
  const handleRemoveService = (id: string) => setMasterData({ ...masterData, services: masterData.services.filter(s => s.id !== id) });
  const handleUpdateService = (id: string, field: keyof ServiceItem, value: any) => setMasterData({ ...masterData, services: masterData.services.map(s => (s.id === id ? { ...s, [field]: value } : s)) });

  const toggleDayActive = (dayKey: string) => setMasterData({ ...masterData, schedule: { ...masterData.schedule, [dayKey]: { ...masterData.schedule[dayKey], isActive: !masterData.schedule[dayKey].isActive } } });
  const addTimeSlot = (dayKey: string) => setMasterData({ ...masterData, schedule: { ...masterData.schedule, [dayKey]: { ...masterData.schedule[dayKey], slots: [...masterData.schedule[dayKey].slots, { start: '09:00', end: '17:00' }] } } });
  const removeTimeSlot = (dayKey: string, slotIndex: number) => setMasterData({ ...masterData, schedule: { ...masterData.schedule, [dayKey]: { ...masterData.schedule[dayKey], slots: masterData.schedule[dayKey].slots.filter((_, i) => i !== slotIndex) } } });
  const updateTimeSlot = (dayKey: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...masterData.schedule[dayKey].slots];
    newSlots[slotIndex][field] = value;
    setMasterData({ ...masterData, schedule: { ...masterData.schedule, [dayKey]: { ...masterData.schedule[dayKey], slots: newSlots } } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse text-stone-500">正在進入大師專屬工作坊...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8 font-sans relative">
      
      {/* 補登八字 Modal */}
      {enrichModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="font-bold text-stone-900">補登命盤資料：{enrichData.clientName}</h3>
              <button onClick={() => setEnrichModalOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEnrichSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">生理性別</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEnrichData({...enrichData, gender: 'M'})} className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-colors ${enrichData.gender === 'M' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'}`}>乾造 (男)</button>
                  <button type="button" onClick={() => setEnrichData({...enrichData, gender: 'F'})} className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-colors ${enrichData.gender === 'F' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-500'}`}>坤造 (女)</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">國曆出生日</label>
                  <input type="date" required value={enrichData.birthDate} onChange={e => setEnrichData({...enrichData, birthDate: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">出生時間</label>
                  <input type="time" required value={enrichData.birthTime} onChange={e => setEnrichData({...enrichData, birthTime: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-sm" />
                </div>
              </div>
              <button type="submit" disabled={enriching} className="w-full py-4 mt-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors flex justify-center items-center gap-2">
                {enriching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 儲存並解鎖戰情室
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 圖片裁切 Modal */}
      {cropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md h-[50vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl">
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={3 / 4} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(ca, cap) => setCroppedAreaPixels(cap as any)} />
          </div>
          <div className="mt-6 flex gap-4 w-full max-w-md">
            <button onClick={() => setCropModalOpen(false)} className="flex-1 py-3 bg-stone-800 text-stone-300 rounded-xl font-medium hover:bg-stone-700 transition-colors">取消</button>
            <button onClick={handleCropSave} disabled={uploadingImage} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors flex justify-center items-center gap-2">
              {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} 確認裁切
            </button>
          </div>
        </div>
      )}

      {/* 訂單戰情室 Modal (一鍵看命盤) */}
      {selectedOrder && calculatedBazi && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-serif">客戶命盤分析</h3>
                <p className="text-sm text-stone-500 mt-1">{selectedOrder.clientName} ({selectedOrder.clientGender === 'F' ? '坤造' : '乾造'})</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-2 text-sm text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                <CalendarClock className="w-4 h-4" /> 國曆出生：{selectedOrder.birthData.year}年{selectedOrder.birthData.month}月{selectedOrder.birthData.day}日 {selectedOrder.birthData.time}
              </div>
              
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex justify-between gap-2 text-center">
                {calculatedBazi.baziResult.map((item: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col gap-1.5">
                    <span className="text-[10px] text-stone-400 font-medium mb-1 tracking-widest">{item.pillar}</span>
                    <div className="w-full bg-white border border-stone-200 rounded-xl py-2 shadow-sm text-lg font-bold font-serif flex items-center justify-center">
                      <span className={getElementColor(item.stemElement)}>{item.stem}</span>
                    </div>
                    <div className="w-full bg-white border border-stone-200 rounded-xl py-2 shadow-sm flex flex-col items-center justify-center min-h-[60px]">
                      <span className={`text-lg font-bold font-serif mb-1 ${getElementColor(item.branchElement)}`}>{item.branch}</span>
                      <div className="flex gap-1 justify-center flex-wrap">
                        {item.hiddenStems.map((hs: string, idx: number) => (
                          <span key={idx} className="text-[9px] text-stone-500 bg-stone-50 px-1 rounded border border-stone-100">{hs}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={calculatedBazi.chartData}>
                    <PolarGrid stroke="#e7e5e4" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={renderCustomTick} />
                    <Radar name="五行" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#34d399" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">我的工作坊</h1>
            <p className="text-stone-500 text-sm mt-1">在這裡雕琢您的對外門面，並管理所有預約。</p>
          </div>
          
          <div className="flex bg-stone-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
             <button type="button" onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}><ClipboardList className="w-4 h-4" /> 訂單管理</button>
             <button type="button" onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}><LayoutDashboard className="w-4 h-4" /> 個人門面</button>
            <button type="button" onClick={() => setActiveTab('services')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}><CreditCard className="w-4 h-4" /> 服務報價</button>
            <button type="button" onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}><CalendarDays className="w-4 h-4" /> 檔期管理</button>
          </div>
          
          <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-stone-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all text-sm"><LogOut className="w-4 h-4" /> 登出</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          <div className="w-full lg:w-2/3 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100 min-h-[600px]">
            
            {/* Tab 0: 訂單管理 */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-lg font-semibold text-stone-800">近期預約名單</h2>
                  <span className="text-sm text-stone-500 bg-stone-100 px-3 py-1 rounded-full">{orders.length} 筆進行中</span>
                </div>
                
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-5 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-300 hover:shadow-md transition-all group">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`text-xs font-medium px-3 py-1 rounded-full outline-none cursor-pointer border-0 shadow-sm transition-colors ${
                              order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-stone-100 text-stone-600'
                            }`}
                          >
                            <option value="pending">待確認</option>
                            <option value="confirmed">已確認</option>
                            <option value="completed">已完成</option>
                            <option value="cancelled">已取消</option>
                          </select>
                          <span className="text-sm font-bold text-stone-900">{order.date} {order.time}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-stone-900 text-lg flex items-center gap-2">
                            {order.clientName} 
                            <span className="text-sm font-normal text-stone-500">{order.serviceName} (HK$ {order.price})</span>
                          </h4>
                          {order.clientPhone && (
                            <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3"/> {order.clientPhone}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* 如果有八字，顯示戰情室按鈕；沒有八字，顯示補登按鈕 */}
                      {order.birthData && order.birthData.year ? (
                        <button 
                          onClick={() => handleOpenClientChart(order)}
                          className="w-full md:w-auto px-4 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <UserSearch className="w-4 h-4" /> 戰情室: 展開命盤
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setEnrichData({ orderId: order.id, clientName: order.clientName, gender: 'F', birthDate: '', birthTime: '12:00' });
                            setEnrichModalOpen(true);
                          }}
                          className="w-full md:w-auto px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Edit3 className="w-4 h-4" /> 補登八字
                        </button>
                      )}
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                      目前尚無預約訂單。當客戶在前台完成預約後，資料會立即顯示於此。
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab !== 'orders' && (
              <div className="mb-8 flex items-center justify-between p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                <div><h3 className="font-medium text-stone-900">接單狀態</h3><p className="text-sm text-stone-500">關閉後，前台將顯示您為「休息中」，並隱藏預約按鈕。</p></div>
                <button type="button" onClick={() => setMasterData({ ...masterData, is_accepting_orders: !masterData.is_accepting_orders })} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${masterData.is_accepting_orders ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${masterData.is_accepting_orders ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            )}

            <form onSubmit={handleSave} className={activeTab === 'orders' ? 'hidden' : 'space-y-8'}>
              {/* Tab 1: 個人門面 */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-lg font-semibold text-stone-800 border-b pb-2">基本資料設定</h2>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-stone-900 flex items-center gap-2">個人形象照 (支援自由裁切)</label>
                    <div onClick={() => fileInputRef.current?.click()} className="relative w-48 aspect-[3/4] border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50 hover:bg-stone-100 hover:border-emerald-500 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-2 text-emerald-700"><Loader2 className="w-6 h-6 animate-spin" /><span className="text-sm">處理中...</span></div>
                      ) : masterData.image_url ? (
                        <><img src={masterData.image_url} alt="Profile" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" /><div className="absolute opacity-0 group-hover:opacity-100 font-medium text-stone-900"><UploadCloud className="w-6 h-6 mx-auto mb-1" />點擊更換</div></>
                      ) : (
                        <div className="text-center text-stone-500"><UploadCloud className="w-8 h-8 mx-auto mb-2 text-stone-400" /><p className="text-sm font-medium text-stone-700">點擊上傳照片</p></div>
                      )}
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={onFileChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-900">稱呼 / 名字</label>
                      <input type="text" value={masterData.name} onChange={(e) => setMasterData({...masterData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 bg-stone-50/50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-900 flex items-center gap-1"><ScrollText className="w-4 h-4 text-emerald-700"/>師承 / 門派 / 認證</label>
                      <input type="text" value={masterData.lineage} onChange={(e) => setMasterData({...masterData, lineage: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 bg-stone-50/50" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-900 flex items-center gap-1"><Sparkles className="w-4 h-4 text-emerald-700"/>詳細個人簡介</label>
                    <textarea value={masterData.bio} onChange={(e) => setMasterData({...masterData, bio: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 bg-stone-50/50 resize-y" rows={4} required />
                  </div>

                  <div className="space-y-3 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                    <label className="text-sm font-medium text-stone-900 flex items-center gap-2"><Hash className="w-4 h-4" /> 擅長領域 (標籤)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {masterData.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                          #{tag} <button type="button" onClick={() => handleRemoveTag(index)} className="hover:bg-emerald-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20" placeholder="輸入關鍵字按 Enter" />
                      <button type="button" onClick={handleAddTag} className="px-6 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-sm font-medium transition-colors">新增</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: 服務報價 */}
              {activeTab === 'services' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex justify-between items-center border-b pb-2">
                     <h2 className="text-lg font-semibold text-stone-800">服務項目與報價</h2>
                     <button type="button" onClick={handleAddService} className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-sm font-medium bg-emerald-50 px-3 py-1.5 rounded-lg"><Plus className="w-4 h-4" /> 新增服務</button>
                   </div>
                   {masterData.services.length === 0 ? (
                      <div className="text-center p-8 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500">尚未設定任何服務項目。</div>
                   ) : (
                     <div className="space-y-4">
                       {masterData.services.map((service) => (
                         <div key={service.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-4 shadow-sm">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-3">
                                 <label className="text-xs font-medium text-stone-500 mb-1 block">服務名稱</label>
                                 <input type="text" value={service.name} onChange={(e) => handleUpdateService(service.id, 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200" required />
                              </div>
                              <div>
                                 <label className="text-xs font-medium text-stone-500 mb-1 block">時長 (分鐘)</label>
                                 <input type="number" value={service.duration} onChange={(e) => handleUpdateService(service.id, 'duration', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-stone-200" required />
                              </div>
                              <div className="md:col-span-2">
                                 <label className="text-xs font-medium text-stone-500 mb-1 block">費用 (HK$)</label>
                                 <input type="number" value={service.price} onChange={(e) => handleUpdateService(service.id, 'price', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-stone-200" required />
                              </div>
                            </div>
                            <button type="button" onClick={() => handleRemoveService(service.id)} className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg mt-6"><Trash2 className="w-5 h-5" /></button>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              )}

              {/* Tab 3: 檔期管理 */}
              {activeTab === 'schedule' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-b pb-2"><h2 className="text-lg font-semibold text-stone-800">常態可預約時段</h2></div>
                  <div className="space-y-4">
                    {DAYS_OF_WEEK.map((day) => {
                      const dayData = masterData.schedule[day.key];
                      return (
                        <div key={day.key} className={`p-4 rounded-xl border transition-all ${dayData?.isActive ? 'border-emerald-200 bg-white' : 'border-stone-100 bg-stone-50'}`}>
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="w-full md:w-32 flex items-center justify-between md:justify-start gap-3 pt-2">
                              <span className={`font-medium ${dayData?.isActive ? 'text-stone-900' : 'text-stone-400'}`}>{day.label}</span>
                              <button type="button" onClick={() => toggleDayActive(day.key)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${dayData?.isActive ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${dayData?.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                              </button>
                            </div>
                            <div className="flex-1 space-y-3">
                              {!dayData?.isActive ? (<p className="text-sm text-stone-400 py-2">休息日，不開放預約</p>) : (
                                <>
                                  {dayData.slots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                      <Clock className="w-4 h-4 text-stone-400" />
                                      <input type="time" value={slot.start} onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)} className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm" required />
                                      <span className="text-stone-400 text-sm">至</span>
                                      <input type="time" value={slot.end} onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)} className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm" required />
                                      {dayData.slots.length > 1 && (<button type="button" onClick={() => removeTimeSlot(day.key, index)} className="p-1.5 text-stone-400 hover:text-rose-500"><X className="w-4 h-4" /></button>)}
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => addTimeSlot(day.key)} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mt-2"><Plus className="w-3 h-3" /> 增加時段</button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-stone-100">
                <button type="submit" disabled={saving} className="w-full py-4 bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 font-medium flex justify-center items-center gap-2 shadow-lg transition-all">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 儲存變更並即時同步
                </button>
              </div>
            </form>
          </div>

          {/* 右側預覽區 */}
          <div className="w-full lg:w-1/3 sticky top-6 hidden lg:block">
            <div className="bg-stone-900 rounded-3xl p-6 shadow-xl text-stone-50">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-700/50">
                <div className="flex items-center gap-2"><Eye className="w-5 h-5 text-emerald-400" /><h3 className="font-medium text-stone-300">前台實時預覽</h3></div>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
               <div className="w-full aspect-[3/4] bg-stone-200 relative">
                  {masterData.image_url ? ( <img src={masterData.image_url} alt="Preview" className="w-full h-full object-cover" /> ) : ( <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm font-medium">尚未上傳照片</div> )}
                  <div className="absolute top-3 right-3 bg-white/90 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-stone-800 shadow-sm"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 5.0</div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-stone-900">{masterData.name || '您的名字'}</h4>
                      <p className="text-xs font-medium text-emerald-700 mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded">{masterData.lineage || '您的師承門派'}</p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-stone-500 mt-3 line-clamp-2">{masterData.bio || '個人簡介...'}</p>
                  <div className="flex flex-wrap gap-1 mt-4 min-h-[24px]">
                    {masterData.tags.slice(0, 3).map((tag, i) => (<span key={i} className="text-[10px] px-2 py-1 bg-stone-100 text-stone-600 rounded-md">#{tag}</span>))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}