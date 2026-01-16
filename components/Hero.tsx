"use client";
import { useTranslations, useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const [fade, setFade] = useState(true); 
  
  const t = useTranslations('Hero');
  const locale = useLocale(); 
  
  const apiLang = locale === 'ar' ? 'ar-SA' : 'en-US'; 
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    async function fetchData() {
      try {
        const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}&language=${apiLang}`;
        const request = await fetch(url);
        const data = await request.json();
        setAllMovies(data.results);
        
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        setMovie(randomMovie);
      } catch (error) {
        console.error("Error fetching hero movie:", error);
      }
    }
    fetchData();
  }, [locale, API_KEY, apiLang]);

  useEffect(() => {
    if (allMovies.length === 0) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        const newRandomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
        setMovie(newRandomMovie);
        setFade(true);
      }, 500); 
    }, 8000);
    return () => clearInterval(interval);
  }, [allMovies]);

  if (!movie) return null;

  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];

  return (
    <div className="relative w-full h-[67vh] md:h-[85vh] text-white overflow-hidden group">
      
      {/* الخلفية */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent z-10" />
        
        <img 
          src={`https://image.tmdb.org/t/p/original/${movie?.backdrop_path}`} 
          alt={movie?.title || movie?.name}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent z-10 ltr:bg-gradient-to-r rtl:bg-gradient-to-l"></div>
      </div>

      {/* المحتوى النصي: تم التعديل هنا لحل مشكلة القص */}
      {/* start-4 end-4: يضمن وجود هامش من الجهتين في الموبايل */}
      <div className={`absolute top-[20%] start-4 max-w-[calc(100%-2rem)] md:start-12 md:end-auto z-20 text-start transition-all duration-700 transform ${fade ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        
        {/* تم تصغير الخط في الموبايل text-3xl لمنع التمدد الزائد */}
        <h1 className="text-3xl md:text-6xl lg:text-7xl font-black mb-4 drop-shadow-2xl text-white leading-tight">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>

        <div className="flex items-center gap-4 mb-6 text-sm md:text-base font-medium">
            <span className="bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">IMDb</span>
            <span className="text-yellow-400 font-bold flex items-center gap-1">
                ⭐ {movie.vote_average?.toFixed(1)}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-200">{year}</span>
        </div>
        
        {/* تم إزالة دالة truncate والاعتماد على line-clamp لقص النص بشكل نظيف */}
        <p className="text-base md:text-xl text-gray-200 mb-8 drop-shadow-lg leading-relaxed line-clamp-6 md:line-clamp-4 break-words max-w-xl">
          {movie?.overview}
        </p>
        
        <div className="flex gap-3 md:gap-4 mt-4 md:mt-0">
          <Link href={`/watch/${movie.id}?type=${movie.first_air_date ? 'tv' : 'movie'}`}>
            <button className="flex items-center gap-2 md:gap-3 px-5 py-2 md:px-8 md:py-3 bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold text-sm md:text-base rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.4)]">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
               </svg>
               {t('play')}
            </button>
          </Link>

          <Link href={`/watch/${movie.id}?type=${movie.first_air_date ? 'tv' : 'movie'}`}>
            <button className="flex items-center gap-2 md:gap-3 px-5 py-2 md:px-8 md:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-sm md:text-base rounded-lg transition-all duration-300 hover:scale-105">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
               </svg>
              {t('more_info')}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;