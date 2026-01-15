"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"; // 👈 سنستخدم هذا للتنقل

interface Movie {
  id: number;
  poster_path: string;
  title: string;
  name?: string;
}

const SearchPage = () => {
  const params = useParams();
  const keyword = params.keyword as string;
  const decodedKeyword = decodeURIComponent(keyword);

  const [movies, setMovies] = useState<Movie[]>([]);
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    if (!keyword) return;
    const fetchSearch = async () => {
      try {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${keyword}&language=ar-SA&include_adult=false`;
        const req = await fetch(url);
        const data = await req.json();
        if (data.results) setMovies(data.results);
      } catch (error) {
        console.error("خطأ في البحث:", error);
      }
    };
    fetchSearch();
  }, [keyword, API_KEY]);

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-4 md:px-12 pb-10">
      <h2 className="text-2xl font-bold mb-6">
        نتائج البحث عن: <span className="text-red-600">&quot;{decodedKeyword}&quot;</span>
      </h2>

      {movies.length === 0 ? (
        <p className="text-gray-400">لا توجد نتائج مطابقة.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            movie.poster_path && (
              // 👈 هنا التغيير: غلفنا الصورة برابط ينقل لصفحة الفيلم
              <Link key={movie.id} href={`/watch/${movie.id}`}>
                <div className="relative group cursor-pointer hover:scale-105 transition duration-300">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="rounded-lg object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 w-full bg-black/80 p-2 text-center text-sm hidden group-hover:block">
                        {movie.title || movie.name}
                    </div>
                </div>
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;