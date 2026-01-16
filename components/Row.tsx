"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl'; // 1. استيراد useLocale

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average?: number;
  media_type?: string;     // نوع الميديا (فيلم/مسلسل)
  first_air_date?: string; // تاريخ خاص بالمسلسلات
}

interface RowProps {
  title: string;
  fetchUrl: string;
  isLargeRow?: boolean;
}

const Row = ({ title, fetchUrl, isLargeRow = false }: RowProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const base_url = "https://image.tmdb.org/t/p/original/";
  
  const locale = useLocale(); // 2. معرفة اللغة الحالية
  const t = useTranslations('Rows');

  // تحديد كود اللغة للـ API
  const apiLang = locale === 'ar' ? 'ar-SA' : 'en-US';

  useEffect(() => {
    async function fetchData() {
      try {
        // 3. دمج رابط الـ URL القادم مع لغة الموقع الحالية
        // نستخدم علامة & لأن الروابط في requests.ts تحتوي غالباً على ?api_key=...
        const request = await fetch(`${fetchUrl}&language=${apiLang}`);
        const data = await request.json();
        if (data.results) {
          setMovies(data.results);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [fetchUrl, apiLang]); // أعد الجلب عند تغيير اللغة أو الرابط

  return (
<div className="w-full max-w-[100%] overflow-hidden px-0 border-b border-gray-900/50 last:border-0">      
      {/* العنوان */}
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3 group cursor-pointer">
        <span className="w-1 h-6 bg-[#FFD700] rounded-full transition-all duration-300 group-hover:h-8"></span>
        <span className="group-hover:text-[#FFD700] transition-colors duration-300">{title}</span>
        
        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 rtl:translate-x-2 group-hover:translate-x-0 text-[#FFD700] text-sm">
           {t('browse_all')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 inline mx-1 rtl:rotate-180">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
        </span>
      </h2>
      
      {/* الكروت */}
      <div className="flex items-center gap-4 overflow-x-scroll scrollbar-hide scroll-smooth md:pb-6 md:pt-6 pb-2 pt-6 px-2">
        {movies.map((movie) => (
          (movie.poster_path || movie.backdrop_path) && (
            // 4. تحسين الرابط: نحدد النوع (tv/movie) لتسهيل عمل صفحة المشاهدة
            <Link 
                key={movie.id} 
                href={`/watch/${movie.id}?type=${movie.media_type || (movie.first_air_date ? 'tv' : 'movie')}`}
            >
                <div 
                  className={`relative flex-none transition-all duration-300 ease-out cursor-pointer group rounded-xl overflow-hidden border-2 border-transparent
                    ${isLargeRow ? "w-[200px] md:w-[240px] h-[300px] md:h-[360px]" : "w-[150px] md:w-[180px] h-[225px] md:h-[270px]"}
                    hover:scale-110 hover:-translate-y-2 hover:z-50 hover:shadow-[0_10px_30px_rgba(255,215,0,0.15)] hover:border-[#FFD700]/50
                  `}
                >
                  <img 
                    src={`${base_url}${isLargeRow ? movie.poster_path : (movie.poster_path || movie.backdrop_path)}`} 
                    alt={movie.name || movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:brightness-75 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    
                    <h3 className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-lg mb-1 line-clamp-2 text-start">
                        {movie?.title || movie?.name}
                    </h3>

                    <div className="flex items-center justify-between mt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-[#FFD700] text-xs font-bold flex items-center gap-1 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                            ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
                        </span>
                        
                        <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                  </div>
                </div>
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

export default Row;