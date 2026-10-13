'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // 請確認你的 supabase 路徑是否正確
import { Upload, Check, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ReviewManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // 表單狀態
  const [clientName, setClientName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 抓取現有評價
  const fetchReviews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setReviews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 處理截圖上傳
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !clientName) return alert('請填寫客戶名稱並選擇截圖！');

    setIsUploading(true);

    try {
      // 1. 產生一個隨機檔名，避免重複
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;

      // 2. 上傳圖片到 Supabase 的 reviews 圖庫
      const { error: uploadError } = await supabase.storage
        .from('reviews')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 3. 取得圖片的公開網址
      const { data: publicUrlData } = supabase.storage
        .from('reviews')
        .getPublicUrl(filePath);

      // 4. 把資料寫入 reviews 資料表 (純文字評價可以留白，我們以圖片為主)
      const { error: dbError } = await supabase
        .from('reviews')
        .insert([
          { 
            client_name: clientName, 
            image_url: publicUrlData.publicUrl,
            content: '見截圖對話', // 預設文字，前台可以選擇不顯示
            is_published: true 
          }
        ]);

      if (dbError) throw dbError;

      alert('好評截圖上傳成功！');
      setClientName('');
      setSelectedFile(null);
      // 清空 input 檔案
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // 重新抓取資料更新畫面
      fetchReviews();

    } catch (error) {
      console.error('上傳失敗:', error);
      alert('上傳失敗，請檢查權限或重試。');
    } finally {
      setIsUploading(false);
    }
  };

  // 切換前台顯示狀態
  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_published: !currentStatus })
      .eq('id', id);
      
    if (!error) {
      fetchReviews();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
      <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-emerald-600" />
        好評截圖管理
      </h2>

      {/* 上傳區塊 */}
      <form onSubmit={handleUpload} className="mb-10 bg-stone-50 p-6 rounded-xl border border-stone-200 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">客戶稱呼 (例如：張先生、Mary)</label>
          <input 
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="請輸入客戶名稱..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp / IG 對話截圖</label>
          <input 
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </div>

        <button 
          type="submit"
          disabled={isUploading}
          className="mt-2 bg-stone-900 text-white py-2.5 rounded-lg hover:bg-stone-800 transition-colors flex justify-center items-center gap-2 disabled:bg-stone-400"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {isUploading ? '圖片上傳中...' : '確認上傳'}
        </button>
      </form>

      {/* 截圖列表區塊 */}
      <h3 className="text-lg font-medium text-stone-800 mb-4">已上傳的評價庫</h3>
      {isLoading ? (
        <div className="text-stone-500 py-4">載入中...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 relative group">
              {/* 圖片展示區 */}
              <div className="h-48 w-full bg-stone-200 flex items-center justify-center overflow-hidden">
                {review.image_url ? (
                  <img src={review.image_url} alt="Review" className="w-full h-full object-cover object-top" />
                ) : (
                  <span className="text-stone-400 text-sm">無截圖 (純文字評價)</span>
                )}
              </div>
              
              {/* 資訊與控制區 */}
              <div className="p-4">
                <div className="font-medium text-stone-900 mb-2">{review.client_name}</div>
                
                <button 
                  onClick={() => togglePublish(review.id, review.is_published)}
                  className={`w-full py-1.5 rounded-md text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                    review.is_published 
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}
                >
                  {review.is_published ? <><Check className="w-4 h-4" /> 顯示於前台</> : <><X className="w-4 h-4" /> 隱藏中</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}