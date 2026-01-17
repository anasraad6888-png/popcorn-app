"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";

interface Movie {
  id: number;
  poster_path: string;
  title: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

const SearchPage = () => {
  const params = useParams();
  const keyword = params.keyword as string;
  const decodedKeyword = decodeURIComponent(keyword);
  const locale = useLocale();
  const isAr = locale === "ar";

  // 1. حالات البيانات (Data States)
  const [allMovies, setAllMovies] = useState<Movie[]>([]); // النتائج الأصلية من API
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]); // النتائج بعد الفلترة
  const [loading, setLoading] = useState(true);

  // 2. حالات الفلاتر (Filter States)
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popularity"); // popularity, newest, oldest, rating

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // --- 1. جلب البيانات من API ---
  useEffect(() => {
    if (!keyword) return;
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const lang = isAr ? "ar-SA" : "en-US";
        // نجلب 3 صفحات لضمان وجود نتائج كافية للفلترة (اختياري)
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${keyword}&language=${lang}&include_adult=false&page=1`;
        
        const req = await fetch(url);
        const data = await req.json();
        
        if (data.results) {
          setAllMovies(data.results);
          setFilteredMovies(data.results); // مبدئياً نعرض الكل
        }
      } catch (error) {
        console.error("خطأ في البحث:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [keyword, API_KEY, isAr]);

  // --- 2. منطق الفلترة والترتيب (يعمل كلما تغيرت الفلاتر) ---
  useEffect(() => {
    let result = [...allMovies];

    // أ. فلترة حسب السنة
    if (yearStart) {
      result = result.filter((m) => {
        const year = parseInt((m.release_date || "").split("-")[0]);
        return year >= parseInt(yearStart);
      });
    }
    if (yearEnd) {
      result = result.filter((m) => {
        const year = parseInt((m.release_date || "").split("-")[0]);
        return year <= parseInt(yearEnd);
      });
    }

    // ب. فلترة حسب التقييم
    if (minRating > 0) {
      result = result.filter((m) => m.vote_average >= minRating);
    }

    // ج. الترتيب (Sorting)
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => 
          new Date(b.release_date || "").getTime() - new Date(a.release_date || "").getTime()
        );
        break;
      case "oldest":
        result.sort((a, b) => 
          new Date(a.release_date || "").getTime() - new Date(b.release_date || "").getTime()
        );
        break;
      case "rating_desc": // الأعلى تقييماً
        result.sort((a, b) => b.vote_average - a.vote_average);
        break;
      default: // popularity (الافتراضي من API غالباً يكون مرتباً، لكن يمكننا تركه كما هو)
        break;
    }

    setFilteredMovies(result);
  }, [allMovies, yearStart, yearEnd, minRating, sortBy]);

  // --- دالة إعادة ضبط الفلاتر ---
  const resetFilters = () => {
    setYearStart("");
    setYearEnd("");
    setMinRating(0);
    setSortBy("popularity");
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 md:pt-32 px-6 md:px-12 pb-10">
      
      {/* العنوان */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          {isAr ? "نتائج البحث عن:" : "Search Results for:"} 
          <span className="text-[#FFD700]">&quot;{decodedKeyword}&quot;</span>
          <span className="text-sm text-gray-500 font-normal mt-1 mx-2">
             ({filteredMovies.length} {isAr ? "نتيجة" : "results"})
          </span>
        </h2>
      </div>

      {/* --- قسم الفلاتر (التصميم الجديد) --- */}
      <div className="bg-[#1f1f1f] p-6 rounded-2xl mb-10 border border-gray-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. فلتر السنة (من - إلى) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-bold">{isAr ? "السنة (من - إلى)" : "Year Range"}</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={isAr ? "من" : "From"}
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
                className="w-full bg-[#141414] border border-gray-700 rounded-lg px-3 py-2 focus:border-[#FFD700] focus:outline-none text-white transition-colors placeholder-gray-600"
              />
              <input
                type="number"
                placeholder={isAr ? "إلى" : "To"}
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
                className="w-full bg-[#141414] border border-gray-700 rounded-lg px-3 py-2 focus:border-[#FFD700] focus:outline-none text-white transition-colors placeholder-gray-600"
              />
            </div>
          </div>

          {/* 2. فلتر التقييم */}
          <div className="flex flex-col gap-2">
             <label className="text-sm text-gray-400 font-bold flex justify-between">
                {isAr ? "الحد الأدنى للتقييم" : "Min Rating"}
                <span className="text-[#FFD700]">{minRating}+ ⭐</span>
             </label>
             <input 
                type="range" 
                min="0" max="10" step="1"
                value={minRating}
                onChange={(e) => setMinRating(parseInt(e.target.value))}
                className="w-full accent-[#FFD700] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2"
             />
             <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>0</span><span>5</span><span>10</span>
             </div>
          </div>

          {/* 3. الترتيب */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-bold">{isAr ? "ترتيب حسب" : "Sort By"}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#141414] border border-gray-700 rounded-lg px-3 py-2.5 focus:border-[#FFD700] focus:outline-none text-white transition-colors appearance-none"
            >
              <option value="popularity">{isAr ? "الأكثر شهرة (تلقائي)" : "Most Popular"}</option>
              <option value="newest">{isAr ? "الأحدث إصداراً" : "Newest Released"}</option>
              <option value="oldest">{isAr ? "الأقدم إصداراً" : "Oldest Released"}</option>
              <option value="rating_desc">{isAr ? "الأعلى تقييماً" : "Top Rated"}</option>
            </select>
          </div>

          {/* 4. زر إعادة الضبط */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-lg transition-all active:scale-95 border border-transparent hover:border-gray-500"
            >
              {isAr ? "إعادة ضبط الفلاتر ↺" : "Reset Filters ↺"}
            </button>
          </div>
        </div>
      </div>

      {/* --- عرض النتائج --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 bg-[#1f1f1f] rounded-2xl border border-dashed border-gray-700">
          <p className="text-gray-400 text-lg mb-2">{isAr ? "لا توجد نتائج مطابقة للفلاتر الحالية." : "No results match your filters."}</p>
          <button onClick={resetFilters} className="text-[#FFD700] underline hover:text-white transition">
             {isAr ? "مسح الفلاتر" : "Clear Filters"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            movie.poster_path && (
              <Link key={movie.id} href={`/watch/${movie.id}?type=movie`}>
                <div className="relative group cursor-pointer bg-[#1f1f1f] rounded-xl overflow-hidden shadow-lg border border-transparent hover:border-[#FFD700]/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all duration-300">
                    
                    {/* الصورة */}
                    <div className="aspect-[2/3] w-full overflow-hidden">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>

                    {/* المعلومات العائمة */}
                    <div className="absolute top-2 start-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 z-10">
                        <span className="text-[#FFD700] text-xs">★</span>
                        <span className="text-white text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
                    </div>

                    <div className="absolute top-2 end-2 bg-[#FFD700] text-black px-2 py-0.5 rounded text-[10px] font-bold">
                        {(movie.release_date || "").split('-')[0]}
                    </div>

                    {/* النص السفلي */}
                    <div className="p-4 bg-[#1f1f1f] relative z-20">
                        <h3 className="font-bold text-sm text-white group-hover:text-[#FFD700] transition-colors line-clamp-1">
                            {movie.title || movie.name}
                        </h3>
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