"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

// تعريف نوع البيانات المشترك (فيلم أو مسلسل)
interface TrendingItem {
  id: number;
  title?: string;      // للأفلام
  name?: string;       // للمسلسلات
  media_type: string;  // 'movie' أو 'tv'
  poster_path: string;
  vote_average: number;
  release_date?: string;    // للأفلام
  first_air_date?: string;  // للمسلسلات
}

export default function TrendingPage() {
  const locale = useLocale();
  const t = useTranslations('Sidebar'); // لاستخدام كلمة "Trending"
  
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // دالة جلب البيانات الرائجة
  const fetchTrending = async (pageNum: number) => {
    try {
      const lang = locale === 'ar' ? 'ar-SA' : 'en-US';
      // trending/all/week لجلب كل الأنواع خلال الأسبوع
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}&language=${lang}&page=${pageNum}`
      );
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching trending:", error);
      return [];
    }
  };

  // 1. التحميل الأولي
  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      const newItems = await fetchTrending(1);
      setItems(newItems);
      setLoading(false);
    };
    initialFetch();
  }, [locale]);

  // 2. تحميل المزيد
  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const newItems = await fetchTrending(nextPage);
    
    // دمج العناصر الجديدة (مع تصفية التكرار إن وجد)
    setItems((prev) => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewItems = newItems.filter((item: TrendingItem) => !existingIds.has(item.id));
        return [...prev, ...uniqueNewItems];
    });
    
    setPage(nextPage);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6 md:p-12 md:ps-24 md:pt-24 pt-24">
      
      {/* العنوان */}
      <div className="flex items-end gap-4 mb-8 border-b border-gray-800 pb-0">
          <h1 className="text-3xl md:text-3xl mb-6 font-bold flex items-center gap-3">
             <span className="w-2 h-10 bg-[#FFD700] rounded-full shadow-[0_0_15px_#FFD700]"></span>
             {t('trending')} 🔥
          </h1>
      </div>

      {/* شبكة العرض */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
        {items.map((item, index) => (
          <Link 
            key={`${item.id}-${index}`} 
            // 💡 هنا نستخدم media_type القادم من API لتحديد النوع بدقة
            href={`/watch/${item.id}?type=${item.media_type}`} 
            className="group relative bg-[#1f1f1f] rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg border border-transparent hover:border-[#FFD700]/50"
          >
            <div className="aspect-[2/3] w-full relative">
              <img 
                src={item.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
                  : '/placeholder.png'
                } 
                alt={item.title || item.name} 
                className="w-full h-full object-cover"
              />
              
              {/* شارة التقييم */}
              <div className="absolute top-2 start-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                <span className="text-[#FFD700] text-xs">★</span>
                <span className="text-white text-xs font-bold">{item.vote_average.toFixed(1)}</span>
              </div>

              {/* شارة النوع (فيلم أو مسلسل) للتوضيح */}
              <div className="absolute top-2 end-2 bg-[#FFD700] text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                {item.media_type === 'movie' ? (locale === 'ar' ? 'فيلم' : 'Movie') : (locale === 'ar' ? 'مسلسل' : 'TV')}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-[#FFD700] transition-colors">
                {item.title || item.name}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                {(item.release_date || item.first_air_date)?.split('-')[0] || 'N/A'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* زر عرض المزيد */}
      <div className="flex justify-center pb-8">
        <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-[#FFD700] text-black font-bold py-3 px-8 rounded-full hover:bg-[#FFC000] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {loadingMore ? (
                <>
                   <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                   {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </>
            ) : (
                locale === 'ar' ? 'عرض المزيد' : 'Load More'
            )}
        </button>
      </div>

    </div>
  );
}