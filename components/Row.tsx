"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// تحديث الواجهة لتشمل التقييم
interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average?: number; // أضفنا هذا الحقل
}

interface RowProps {
  title: string;
  fetchUrl: string;
  isLargeRow?: boolean; // خيار لجعل بعض الصفوف أكبر (مثل Netflix Originals)
}

const Row = ({ title, fetchUrl, isLargeRow = false }: RowProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const base_url = "https://image.tmdb.org/t/p/original/";

  useEffect(() => {
    async function fetchData() {
      try {
        const request = await fetch(fetchUrl);
        const data = await request.json();
        if (data.results) {
          setMovies(data.results);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [fetchUrl]);

  return (
    <div className="py-1 pl-4 md:pl-8 border-b border-gray-900/50 last:border-0">
      
      {/* عنوان القسم مع شريط جانبي جمالي */}
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3 group cursor-pointer">
        <span className="w-1 h-6 bg-[#FFD700] rounded-full transition-all duration-300 group-hover:h-8"></span>
        <span className="group-hover:text-[#FFD700] transition-colors duration-300">{title}</span>
        
        {/* سهم صغير يظهر عند التمرير على العنوان */}
        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 text-[#FFD700] text-sm">
            تصفح الكل 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 inline mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
        </span>
      </h2>
      
      {/* حاوية الكروت مع مساحة (padding) للحركة */}
      <div className="flex items-center gap-4 overflow-x-scroll scrollbar-hide scroll-smooth pb-12 pt-6 px-2">
        {movies.map((movie) => (
          (movie.poster_path || movie.backdrop_path) && (
            <Link key={movie.id} href={`/movie/${movie.id}`}>
                <div 
                  className={`relative flex-none transition-all duration-300 ease-out cursor-pointer group rounded-xl overflow-hidden border-2 border-transparent
                    ${isLargeRow ? "w-[200px] md:w-[240px] h-[300px] md:h-[360px]" : "w-[150px] md:w-[180px] h-[225px] md:h-[270px]"}
                    
                    /* تأثيرات التمرير: تكبير + رفع + ظل ذهبي */
                    hover:scale-110 hover:-translate-y-2 hover:z-50 hover:shadow-[0_10px_30px_rgba(255,215,0,0.15)] hover:border-[#FFD700]/50
                  `}
                >
                  {/* الصورة */}
                  <img 
                    src={`${base_url}${isLargeRow ? movie.poster_path : (movie.poster_path || movie.backdrop_path)}`} 
                    alt={movie.name || movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:brightness-75 group-hover:scale-105"
                  />
                  
                  {/* الطبقة الشفافة والمعلومات (تظهر عند التمرير) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    
                    {/* العنوان */}
                    <h3 className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-lg mb-1 line-clamp-2">
                        {movie?.title || movie?.name}
                    </h3>

                    {/* التقييم وزر التشغيل */}
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