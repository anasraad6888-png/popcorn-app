"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // لاستخراج الكلمة من الرابط
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Movie {
  id: number;
  poster_path: string;
  backdrop_path: string;
  title: string;
  name?: string;
}

const SearchPage = () => {
  const params = useParams();
  const keyword = params.keyword as string; // الكلمة التي بحثت عنها (مشفرة)
  const decodedKeyword = decodeURIComponent(keyword); // فك التشفير (لتحويل %20 إلى مسافة)

  const [movies, setMovies] = useState<Movie[]>([]);

  // مفتاحك السري (يمكنك جلبه من env أو وضعه هنا مؤقتاً للتجربة)
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    if (!keyword) return;

    const fetchSearch = async () => {
      try {
        // رابط البحث الخاص بـ TMDB
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${keyword}&language=ar-SA&include_adult=false`;
        
        const req = await fetch(url);
        const data = await req.json();
        
        if (data.results) {
          setMovies(data.results);
        }
      } catch (error) {
        console.error("خطأ في البحث:", error);
      }
    };

    fetchSearch();
  }, [keyword, API_KEY]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-32 px-4 md:px-12">
        <h2 className="text-2xl font-bold mb-6">
          نتائج البحث عن: <span className="text-red-600">&quot;{decodedKeyword}&quot;</span>
        </h2>

        {movies.length === 0 ? (
          <p className="text-gray-400">لا توجد نتائج مطابقة.</p>
        ) : (
          /* شبكة عرض الأفلام */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              movie.poster_path && (
                <div key={movie.id} className="relative group cursor-pointer hover:scale-105 transition duration-300">
                    {/* سنعرض الصورة فقط، ويمكنك تطويرها لتشغل فيديو لاحقاً */}
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="rounded-lg object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 w-full bg-black/80 p-2 text-center text-sm hidden group-hover:block">
                        {movie.title || movie.name}
                    </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;