"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { account, storage } from '../app/appwrite';
import { useTranslations, useLocale } from 'next-intl';
import { useSidebar } from "@/app/context/SidebarContext";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
}

const Navbar = () => {
  const t = useTranslations('Navbar');
  const locale = useLocale(); 
  const isAr = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const { isVisible: isSidebarVisible } = useSidebar();

  const BUCKET_ID = '696a3bb00027ac5ddf45'; 

  // --- حالات البحث والفلاتر ---
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // حالات الفلترة الجديدة 🎛️
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterYearStart, setFilterYearStart] = useState("");
  const [filterYearEnd, setFilterYearEnd] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState("popularity"); // popularity, new, old, rating

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const switchLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setShowMobileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.href = '/'; 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const sessionUser = await account.get();
        setUser(sessionUser);
        if (sessionUser.prefs && sessionUser.prefs.avatarId) {
             const fileView = storage.getFileView(BUCKET_ID, sessionUser.prefs.avatarId);
             setAvatarUrl(fileView.toString());
        }
      } catch (error) {
        setUser(null);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- منطق البحث والفلترة ---
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (query.length > 2) {
      setLoading(true);
      setShowDropdown(true); // إظهار القائمة دائماً عند الكتابة

      searchTimeout.current = setTimeout(async () => {
        try {
          const apiLang = locale === 'ar' ? 'ar-SA' : 'en-US';
          const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}&language=${apiLang}&include_adult=false`;
          
          const req = await fetch(url);
          const data = await req.json();
          
          let fetchedResults: SearchResult[] = data.results || [];

          // 1. تطبيق الفلترة (Filtering)
          if (filterYearStart || filterYearEnd || filterRating > 0) {
            fetchedResults = fetchedResults.filter(item => {
                const date = item.release_date || item.first_air_date || "";
                const year = parseInt(date.split('-')[0]) || 0;
                
                const passStart = filterYearStart ? year >= parseInt(filterYearStart) : true;
                const passEnd = filterYearEnd ? year <= parseInt(filterYearEnd) : true;
                const passRating = item.vote_average >= filterRating;

                return passStart && passEnd && passRating;
            });
          }

          // 2. تطبيق الترتيب (Sorting)
          if (sortBy === 'new') {
            fetchedResults.sort((a, b) => new Date(b.release_date || b.first_air_date || "").getTime() - new Date(a.release_date || a.first_air_date || "").getTime());
          } else if (sortBy === 'old') {
            fetchedResults.sort((a, b) => new Date(a.release_date || a.first_air_date || "").getTime() - new Date(b.release_date || b.first_air_date || "").getTime());
          } else if (sortBy === 'rating') {
            fetchedResults.sort((a, b) => b.vote_average - a.vote_average);
          }

          // نأخذ أول 5 نتائج بعد الفلترة
          setResults(fetchedResults.slice(0, 5));

        } catch (error) {
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      }, 500);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [query, API_KEY, locale, filterYearStart, filterYearEnd, filterRating, sortBy]); // إضافة الفلاتر للمصفوفة ليعيد البحث عند تغييرها

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/search/${query}`);
      setShowDropdown(false);
      setShowFilterPanel(false);
    }
  };

  return (
    <nav 
        className={`
            fixed top-0 start-0 w-full z-40 
            transition-all duration-500 ease-in-out 
            p-4 md:py-4 md:pe-8 
            ${isSidebarVisible ? 'md:ps-16' : 'md:ps-4'} 
            ${show ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}
        `}
    >      
      <div className="flex items-center justify-between gap-4">
        
        {/* اللوجو */}
        <div className="flex items-center gap-8">
            <Link href="/">
                <img src={t('logo_mobile')} alt="PopCorn" className="block md:hidden w-10 h-10 object-contain cursor-pointer hover:scale-105 transition-transform duration-200" />
                <img src={t('logo')} alt="PopCorn" className="hidden md:block w-24 md:w-32 h-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-200" />
            </Link>
            
            <ul className="hidden md:flex gap-6 text-gray-300 text-sm font-medium">
                <Link href="/"><li className="hover:text-[#FFD700] cursor-pointer transition">{t('home')}</li></Link>
                <Link href="/search/movie"><li className="hover:text-[#FFD700] cursor-pointer transition">{t('movies')}</li></Link>
                <Link href="/search/series"><li className="hover:text-[#FFD700] cursor-pointer transition">{t('series')}</li></Link>
            </ul>
        </div>

        {/* --- منطقة البحث المحسنة --- */}
        <div className="relative flex-1 max-w-lg mx-2 md:mx-4 z-50">          
            <form onSubmit={handleSubmit} className="relative w-full">
                <input 
                    type="text" 
                    placeholder={t('search_placeholder')}
                    className="w-full bg-[#2b2b2b]/90 backdrop-blur-md text-white text-sm rounded-full px-5 py-2.5 ps-10 pe-10 focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all border border-transparent focus:border-transparent placeholder-gray-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 2 && setShowDropdown(true)}
                />
                <button type="submit" className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</button>
                
                {/* زر الفلتر الجديد 🎛️ */}
                <button 
                    type="button"
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={`absolute end-3 top-1/2 -translate-y-1/2 transition-colors ${showFilterPanel || filterRating > 0 || filterYearStart ? 'text-[#FFD700]' : 'text-gray-400 hover:text-white'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" clipRule="evenodd" />
                    </svg>
                </button>
            </form>

            {/* --- لوحة الفلاتر (Dropdown Panel) --- */}
            {showFilterPanel && (
                <div className="absolute top-12 end-0 w-full md:w-80 bg-[#1f1f1f] border border-gray-700 rounded-xl shadow-2xl p-4 z-[70] animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[#FFD700] text-sm font-bold flex items-center gap-2">
                             {isAr ? 'تصفية النتائج' : 'Filter Results'}
                        </h3>
                        <button onClick={() => {
                            setFilterYearStart(""); setFilterYearEnd(""); setFilterRating(0); setSortBy("popularity");
                        }} className="text-xs text-gray-500 hover:text-white underline">
                            {isAr ? 'إعادة تعيين' : 'Reset'}
                        </button>
                    </div>

                    {/* السنة */}
                    <div className="mb-3">
                        <label className="text-xs text-gray-400 block mb-1">{isAr ? 'السنة (من - إلى)' : 'Year (From - To)'}</label>
                        <div className="flex gap-2">
                            <input type="number" placeholder="1990" value={filterYearStart} onChange={(e) => setFilterYearStart(e.target.value)} className="w-1/2 bg-[#141414] border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-[#FFD700] outline-none"/>
                            <input type="number" placeholder="2025" value={filterYearEnd} onChange={(e) => setFilterYearEnd(e.target.value)} className="w-1/2 bg-[#141414] border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-[#FFD700] outline-none"/>
                        </div>
                    </div>

                    {/* التقييم */}
                    <div className="mb-3">
                        <label className="text-xs text-gray-400 flex justify-between mb-1">
                            <span>{isAr ? 'الحد الأدنى للتقييم' : 'Min Rating'}</span>
                            <span className="text-[#FFD700] font-bold">{filterRating}+ ⭐</span>
                        </label>
                        <input type="range" min="0" max="10" step="1" value={filterRating} onChange={(e) => setFilterRating(parseInt(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"/>
                    </div>

                    {/* الترتيب */}
                    <div className="mb-2">
                        <label className="text-xs text-gray-400 block mb-1">{isAr ? 'ترتيب حسب' : 'Sort By'}</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-[#141414] border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:border-[#FFD700] outline-none">
                            <option value="popularity">{isAr ? 'الأكثر شهرة' : 'Most Popular'}</option>
                            <option value="new">{isAr ? 'الأحدث' : 'Newest'}</option>
                            <option value="old">{isAr ? 'الأقدم' : 'Oldest'}</option>
                            <option value="rating">{isAr ? 'الأعلى تقييماً' : 'Top Rated'}</option>
                        </select>
                    </div>
                </div>
            )}

            {/* --- نتائج البحث --- */}
            {showDropdown && (query.length > 2) && !showFilterPanel && (
                <div className="absolute top-12 start-0 w-full bg-[#1f1f1f] rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-[60]">
                    {loading ? (
                        <div className="p-4 text-center items-center flex justify-center gap-2 text-gray-400 text-sm">
                            <div className="w-4 h-4 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                            {t('searching')}
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            {results.map((item) => item.poster_path && (
                            <Link key={item.id} href={`/watch/${item.id}?type=${item.media_type}`} onClick={() => { setQuery(""); setShowDropdown(false); }}>
                                <div className="flex gap-4 p-3 hover:bg-[#333] transition cursor-pointer border-b border-gray-800 last:border-0 group">
                                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} className="w-10 h-14 object-cover rounded bg-gray-800"/>
                                    <div className="flex flex-col justify-center flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-white font-bold text-sm group-hover:text-[#FFD700] transition line-clamp-1 text-start">{item.title || item.name}</h4>
                                            <span className="text-[10px] bg-gray-800 px-1 rounded text-gray-300">
                                                {(item.release_date || item.first_air_date || "").split('-')[0]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-yellow-500 text-xs font-bold">⭐ {item.vote_average?.toFixed(1)}</span>
                                            <span className="text-xs text-gray-500">• {item.media_type === 'movie' ? (isAr ? 'فيلم' : 'Movie') : (isAr ? 'مسلسل' : 'TV')}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            ))}
                            <div 
                                onClick={handleSubmit}
                                className="p-2 text-center text-xs text-[#FFD700] bg-[#141414] hover:bg-[#333] cursor-pointer font-bold border-t border-gray-800"
                            >
                                {isAr ? 'عرض كل النتائج' : 'View All Results'}
                            </div>
                        </>
                    ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">{t('no_results')}</div>
                    )}
                </div>
            )}
        </div>

        {/* القسم الأيمن (اللغة، المستخدم) */}
        <div className="relative flex items-center gap-4 shrink-0"> 
            
            <div className="hidden md:flex items-center gap-4">
                <button onClick={switchLanguage} className="flex items-center justify-center border border-gray-600 hover:border-[#FFD700] text-gray-300 hover:text-[#FFD700] px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300">
                    {locale === 'ar' ? 'English' : 'العربية'}
                </button>

                {user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-white font-medium text-sm">
                            {t('welcome')} <span className="text-[#FFD700] font-bold">{user.name}</span>
                        </span>
                        
                        <div className="w-9 h-9 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold text-lg overflow-hidden border border-[#FFD700] shadow-md">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"}</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <Link href="/login">
                        <button className="px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-sm transition-all duration-300 hover:bg-white/10 hover:border-[#FFD700]/50 hover:text-[#FFD700] hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                            {t('login')}
                        </button>
                    </Link>
                )}
            </div>

            {/* زر القائمة للموبايل */}
            <button className="md:hidden p-2 text-white bg-white/10 rounded-lg hover:bg-white/20 transition" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>

            {/* قائمة الموبايل */}
            {showMobileMenu && (
                <div className="absolute top-14 end-0 w-56 bg-[#1f1f1f] border border-gray-700 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-50 md:hidden animate-in fade-in slide-in-from-top-2">
                    {user ? (
                        <div className="text-white text-xs p-3 text-center border-b border-gray-700 mb-1 flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold text-lg overflow-hidden border border-[#FFD700]">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"}</span>
                                )}
                            </div>
                            <div>
                                {locale === 'ar' ? 'أهلاً' : 'Hello'} <span className="text-[#FFD700] font-bold text-sm">{user.name}</span>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setShowMobileMenu(false)}>
                            <button className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[#FFD700] text-black font-bold text-sm hover:bg-[#FFC000]">
                                {t('login')}
                            </button>
                        </Link>
                    )}

                    <button onClick={switchLanguage} className="w-full flex items-center justify-between p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition text-sm font-medium">
                        <span>{locale === 'ar' ? 'اللغة' : 'Language'}</span>
                        <span className="text-[#FFD700] font-bold text-xs border border-[#FFD700] px-1.5 rounded">{locale === 'ar' ? 'English' : 'العربية'}</span>
                    </button>

                    <button onClick={handleLogout} disabled={!user} className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm font-bold transition ${user ? "text-red-500 hover:bg-red-500/10 cursor-pointer" : "text-gray-600 cursor-not-allowed opacity-50"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                        {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;