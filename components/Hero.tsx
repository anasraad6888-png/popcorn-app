"use client";

import React, { useEffect, useState } from 'react';
import requests from '../utils/requests';

// 1. تعريف "هوية" الفيلم (عشان TypeScript يرتاح)
interface Movie {
  id: number;
  title?: string;      // علامة ؟ تعني أن الاسم قد يكون موجوداً أو لا (لأن بعضها مسلسلات)
  name?: string;
  original_name?: string;
  backdrop_path?: string;
  overview?: string;
}

const Hero = () => {
  // 2. الآن نقول له: هذا المتغير سيحمل "فيلم" أو "لا شيء" (null)
  const [movie, setMovie] = useState<Movie | null>(null);
const [allMovies, setAllMovies] = useState<Movie[]>([]); // 👈 أضف هذا السطر
  useEffect(() => {
    async function fetchData() {
      const request = await fetch(requests.fetchTrending);
      const data = await request.json();
        setAllMovies(data.results); // 👈 أضف هذا السطر لحفظ القائمة كاملة
      const randomMovie = data.results[
        Math.floor(Math.random() * data.results.length)
      ];

      setMovie(randomMovie);
    }
    fetchData();
  }, []);
// هذا الكود المسؤول عن التبديل كل 5 ثوانٍ
  useEffect(() => {
    if (allMovies.length === 0) return; // لو القائمة فارغة لا تفعل شيئاً

    const interval = setInterval(() => {
      // اختيار فيلم عشوائي جديد من القائمة المحفوظة
      const newRandomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
      setMovie(newRandomMovie);
    }, 5000); // 5000 تعني 5 ثوانٍ

    return () => clearInterval(interval); // تنظيف العداد عند الخروج
  }, [allMovies]);
  // دالة التقصير (تم تحسينها لتقبل النص الفارغ أيضاً)
  function truncate(str: string | undefined, n: number) {
    if (!str) return ""; // حماية إضافية
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
  }

  if (!movie) return null;

  return (
    <div className="relative h-[70vh] w-full text-white">
      
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-full h-full bg-gradient-to-r from-black via-transparent to-transparent z-10" />
        <img 
          key={movie?.id}
          src={`https://image.tmdb.org/t/p/original/${movie?.backdrop_path}`} 
          alt={movie?.title || movie?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 w-full h-44 bg-gradient-to-t from-black to-transparent z-10"></div>
      </div>

      <div className="absolute top-[35%] right-8 md:right-16 z-20 max-w-xl text-right">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        
        <p className="text-lg text-gray-200 mb-6 drop-shadow-md leading-relaxed">
          {truncate(movie?.overview, 150)}
        </p>
        
        <div className="flex gap-4">
          <button className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center gap-2 transition">
             تشغيل
          </button>
          <button className="px-8 py-2 bg-gray-600/80 hover:bg-gray-600 text-white font-bold rounded flex items-center gap-2 transition">
             المزيد
          </button>
        </div>
      </div>

    </div>
  );
};

export default Hero;