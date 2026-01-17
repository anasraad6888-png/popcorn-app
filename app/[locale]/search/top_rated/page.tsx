"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

// تعريف نوع البيانات
interface TopRatedItem {
  id: number;
  title?: string;      // للأفلام
  name?: string;       // للمسلسلات
  media_type?: string; // سنقوم بإضافته يدوياً لأن endpoint top_rated لا يعيده دائماً
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  vote_count: number; // 👈 مهم: لنعرض فقط الأعمال التي لها عدد تقييمات معقول
}

export default function TopRatedPage() {
  const locale = useLocale();
  const t = useTranslations('Sidebar'); // لاستخدام العناوين
  const tRows = useTranslations('Rows'); // لاستخدام عنوان "Top Rated"
  
  const [items, setItems] = useState<TopRatedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // دالة لجلب البيانات (أفلام + مسلسلات) ودمجهم
  const fetchTopRated = async (pageNum: number) => {
    try {
      const lang = locale === 'ar' ? 'ar-SA' : 'en-US';
      
      // 1. جلب أفضل الأفلام
      const moviesReq = fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=${lang}&page=${pageNum}`
      );
      
      // 2. جلب أفضل المسلسلات
      const tvReq = fetch(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=${lang}&page=${pageNum}`
      );

      const [moviesRes, tvRes] = await Promise.all([moviesReq, tvReq]);
      const moviesData = await moviesRes.json();
      const tvData = await tvRes.json();

      // 3. إضافة نوع الميديا يدوياً لأن endpoint top_rated لا يوفره
      const movies = (moviesData.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
      const series = (tvData.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));

      // 4. دمج المصفوفتين وترتيبهما حسب التقييم
      const combined = [...movies, ...series].sort((a, b) => b.vote_average - a.vote_average);

      return combined;
    } catch (error) {
      console.error("Error fetching top rated:", error);
      return [];
    }
  };

  // 1. التحميل الأولي
  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      const newItems = await fetchTopRated(1);
      setItems(newItems);
      setLoading(false);
    };
    initialFetch();
  }, [locale]);

  // 2. تحميل المزيد
  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const newItems = await fetchTopRated(nextPage);
    
    // دمج النتائج وتصفية التكرار
    setItems((prev) => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
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
             {tRows('top_rated')} 💎
          </h1>
      </div>        

      {/* شبكة العرض */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
        {items.map((item, index) => (
          <Link 
            key={`${item.id}-${index}`} 
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
              
              {/* شارة التقييم المميزة */}
              <div className="absolute top-2 start-2 bg-[#FFD700] text-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                <span className="text-xs font-black">{item.vote_average.toFixed(1)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006Z" clipRule="evenodd" />
                </svg>
              </div>

              {/* شارة النوع */}
              <div className="absolute top-2 end-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-white/10">
                {item.media_type === 'movie' ? (locale === 'ar' ? 'فيلم' : 'Movie') : (locale === 'ar' ? 'مسلسل' : 'TV')}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-[#FFD700] transition-colors">
                {item.title || item.name}
              </h3>
              <p className="text-gray-400 text-xs mt-1 flex justify-between">
                <span>{(item.release_date || item.first_air_date)?.split('-')[0] || 'N/A'}</span>
                <span className="text-[#FFD700]/80">({item.vote_count})</span>
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