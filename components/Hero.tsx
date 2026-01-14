"use client";

import React, { useEffect, useState } from 'react';
import requests from '../utils/requests';
import Link from 'next/link';
// تعريف واجهة البيانات
interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_name?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

const Hero = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  
  // حالة للتحكم في شفافية الصورة لعمل تأثير التلاشي الناعم
  const [fade, setFade] = useState(true); 

  // 1. جلب البيانات مرة واحدة
  useEffect(() => {
    async function fetchData() {
      try {
        const request = await fetch(requests.fetchTrending);
        const data = await request.json();
        setAllMovies(data.results);
        
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        setMovie(randomMovie);
      } catch (error) {
        console.error("Error fetching hero movie:", error);
      }
    }
    fetchData();
  }, []);

  // 2. مؤقت التبديل مع تأثير التلاشي
  useEffect(() => {
    if (allMovies.length === 0) return;

    const interval = setInterval(() => {
      // أبدأ الإخفاء
      setFade(false);

      // بعد نصف ثانية (وقت الانيميشن) غير الفيلم وأظهر الصورة
      setTimeout(() => {
        const newRandomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
        setMovie(newRandomMovie);
        setFade(true); // إظهار
      }, 500); // 500ms يجب أن تطابق مدة الـ duration في الـ CSS

    }, 8000); // كل 8 ثواني

    return () => clearInterval(interval);
  }, [allMovies]);

  // دالة تقصير النص
  function truncate(str: string | undefined, n: number) {
    if (!str) return "";
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
  }

  if (!movie) return null;

  // استخراج السنة من التاريخ
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];

  return (
    <div className="relative h-[85vh] w-full text-white overflow-hidden group">
      
      {/* الخلفية والصورة */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* طبقة تظليل علوية خفيفة */}
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent z-10" />
        
        {/* الصورة مع تأثير الحركة والتلاشي */}
        <img 
          src={`https://image.tmdb.org/t/p/original/${movie?.backdrop_path}`} 
          alt={movie?.title || movie?.name}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* تدرج لوني يغطي الصورة لضمان وضوح النص (من اليمين والأسفل) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-[#141414]/90 via-[#141414]/40 to-transparent z-10"></div>
      </div>

      {/* المحتوى النصي */}
      <div className={`absolute top-[30%] right-6 md:right-12 z-20 max-w-2xl text-right transition-all duration-700 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        
        {/* العنوان الضخم */}
        <h1 className="text-5xl md:text-7xl font-black mb-4 drop-shadow-2xl text-white leading-tight">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>

        {/* معلومات إضافية (التقييم والسنة) */}
        <div className="flex items-center gap-4 mb-6 text-sm md:text-base font-medium">
            <span className="bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">IMDb</span>
            <span className="text-yellow-400 font-bold flex items-center gap-1">
                ⭐ {movie.vote_average?.toFixed(1)}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-200">{year}</span>
        </div>
        
        {/* الوصف */}
        <p className="text-lg md:text-xl text-gray-200 mb-8 drop-shadow-lg leading-relaxed line-clamp-3 md:line-clamp-4 max-w-xl">
          {truncate(movie?.overview, 200)}
        </p>
        
        {/* الأزرار */}
{/* الأزرار */}
        <div className="flex gap-3 md:gap-4 mt-4 md:mt-0">
          
          {/* زر التشغيل */}
          <Link href={`/watch/${movie.id}`}>
            <button className="flex items-center gap-2 md:gap-3 px-5 py-2 md:px-8 md:py-3 bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold text-sm md:text-base rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.4)]">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
               </svg>
               تشغيل الآن
            </button>
          </Link>

          {/* زر المزيد */}
          <Link href={`/watch/${movie.id}`}>
            <button className="flex items-center gap-2 md:gap-3 px-5 py-2 md:px-8 md:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-sm md:text-base rounded-lg transition-all duration-300 hover:scale-105">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
               </svg>
               معلومات
            </button>
          </Link>

        </div>
      </div>

    </div>
  );
};

export default Hero;