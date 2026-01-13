"use client";

import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube'; // 1. استيراد مشغل يوتيوب
import movieTrailer from 'movie-trailer'; // 2. استيراد أداة البحث عن الفيديو

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
}

interface RowProps {
  title: string;
  fetchUrl: string;
}

const Row = ({ title, fetchUrl }: RowProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(""); // متغير لتخزين رابط الفيديو

  const base_url = "https://image.tmdb.org/t/p/original/";

  useEffect(() => {
    async function fetchData() {
      try {
        const request = await fetch(fetchUrl);
        if (!request.ok) return;
        const data = await request.json();
        if (data.results) setMovies(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [fetchUrl]);

  // إعدادات مشغل الفيديو (الطول والعرض وتشغيل تلقائي)
  const opts = {
    height: "390",
    width: "100%",
    playerVars: {
      autoplay: 1,
    },
  };

  // دالة التعامل مع النقرة
// دالة التعامل مع النقرة
  const handleClick = (movie: Movie) => {
    if (trailerUrl) {
      // إذا كان الفيديو مفتوحاً، أغلقه
      setTrailerUrl("");
    } else {
      // ابحث عن اسم الفيلم في يوتيوب
      movieTrailer(movie?.name || movie?.title || "")
        .then((url: string | null) => {
          // استخراج كود الفيديو (ID) من رابط يوتيوب الكامل
          const urlParams = new URLSearchParams(new URL(url || "").search);
          setTrailerUrl(urlParams.get("v"));
        })
        // 👇 هنا كان التغيير: استخدمنا unknown بدلاً من any
        .catch((error: unknown) => console.log("لم يتم العثور على تريلر مؤقتاً", error));
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 border-r-4 border-red-600 pr-4">
        {title}
      </h2>
      
      <div className="flex gap-4 overflow-x-scroll scrollbar-hide scroll-smooth py-4">
        {movies && movies.length > 0 && movies.map((movie) => (
          (movie.poster_path || movie.backdrop_path) && (
            <div 
              key={movie.id} 
              // عند الضغط، شغل الدالة
              onClick={() => handleClick(movie)}
              className="min-w-[160px] md:min-w-[180px] h-[240px] md:h-[260px] bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 relative group"
            >
              <img 
                src={`${base_url}${movie.poster_path || movie.backdrop_path}`} 
                alt={movie.name || movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-2">
                <span className="text-white font-bold text-sm">
                    {movie?.title || movie?.name}
                </span>
              </div>
            </div>
          )
        ))}
      </div>

      {/* منطقة عرض الفيديو: تظهر فقط إذا كان هناك رابط */}
      {trailerUrl && (
        <div className="mt-4 w-full">
          <YouTube videoId={trailerUrl} opts={opts} />
        </div>
      )}
    </div>
  );
};

export default Row;