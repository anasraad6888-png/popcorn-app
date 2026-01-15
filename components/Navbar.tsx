"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // 1. أضفنا usePathname
import { account } from '../app/appwrite'; 
import { useTranslations, useLocale } from 'next-intl';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  media_type: string;
}

const Navbar = () => {
  const t = useTranslations('Navbar');
  const locale = useLocale(); // "ar" or "en"
  const router = useRouter();
  const pathname = usePathname(); // الرابط الحالي (مثلاً: /ar/watch/123)

  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // 2. دالة تبديل اللغة
  const switchLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    // نقوم باستبدال كود اللغة الحالي بالكود الجديد في الرابط
    // مثال: /ar/movies -> /en/movies
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const sessionUser = await account.get();
        setUser(sessionUser);
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

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length > 2) {
      setLoading(true);
      setShowDropdown(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const apiLang = locale === 'ar' ? 'ar-SA' : 'en-US';
          const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}&language=${apiLang}&include_adult=false`;
          const req = await fetch(url);
          const data = await req.json();
          if (data.results) setResults(data.results.slice(0, 5));
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
  }, [query, API_KEY, locale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/search/${query}`);
      setShowDropdown(false);
    }
  };

  return (
    <nav className={`fixed top-0 start-0 w-full z-40 transition-all duration-300 p-4 md:py-4 md:ps-20 md:pe-8 ${show ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between gap-4">
        
        {/* اللوجو والقوائم */}
        <div className="flex items-center gap-8">
            <Link href="/">
                <img 
                    src={t('logo')} 
                    alt="PopCorn" 
                    className="w-24 md:w-32 h-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-200" 
                />
            </Link>
            <ul className="hidden md:flex gap-6 text-gray-300 text-sm font-medium">
                <Link href="/"><li className="hover:text-[#FFD700] cursor-pointer transition">{t('home')}</li></Link>
                <li className="hover:text-[#FFD700] cursor-pointer transition">{t('movies')}</li>
                <li className="hover:text-[#FFD700] cursor-pointer transition">{t('series')}</li>
            </ul>
        </div>

        {/* البحث */}
        <div className="relative flex-1 max-w-lg mx-4 hidden md:block">
            <form onSubmit={handleSubmit} className="relative w-full">
                <input 
                    type="text" 
                    placeholder={t('search_placeholder')}
                    className="w-full bg-[#2b2b2b]/80 text-white text-sm rounded-full px-5 py-2.5 ps-10 focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all border border-transparent focus:border-transparent placeholder-gray-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onFocus={() => query.length > 2 && setShowDropdown(true)}
                />
                <button type="submit" className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                </button>
            </form>

            {/* القائمة المنسدلة للبحث */}
            {showDropdown && (query.length > 2) && (
                <div className="absolute top-12 start-0 w-full bg-[#1f1f1f] rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-[60]">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">{t('searching')}</div>
                    ) : results.length > 0 ? (
                        <>
                            {results.map((item) => (
                                item.poster_path && (
                                    <Link key={item.id} href={`/watch/${item.id}?type=${item.media_type}`} onClick={() => setQuery("")}>
                                        <div className="flex gap-4 p-3 hover:bg-[#333] transition cursor-pointer border-b border-gray-800 last:border-0 group">
                                            <img 
                                                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} 
                                                alt={item.title || item.name} 
                                                className="w-12 h-16 object-cover rounded bg-gray-800"
                                            />
                                            <div className="flex flex-col justify-center flex-1">
                                                <h4 className="text-white font-bold text-sm group-hover:text-[#FFD700] transition line-clamp-1 text-start">
                                                    {item.title || item.name}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                    <span className="text-yellow-500 font-bold">⭐ {item.vote_average?.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            ))}
                        </>
                    ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">{t('no_results')}</div>
                    )}
                </div>
            )}
        </div>

        {/* القسم الأيمن: زر اللغة + المستخدم */}
        <div className="flex items-center gap-4 shrink-0"> 
            
            {/* 3. زر تغيير اللغة (الجديد) */}
            <button 
                onClick={switchLanguage}
                className="hidden md:flex items-center justify-center border border-gray-600 hover:border-[#FFD700] text-gray-300 hover:text-[#FFD700] px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300"
            >
                {/* إذا كانت اللغة الحالية عربي، اعرض English، والعكس */}
                {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* المستخدم */}
            {user ? (
                <div className="flex items-center gap-3">
                   <span className="text-white font-medium text-sm hidden md:block">
                     {t('welcome')} <span className="text-[#FFD700] font-bold">{user.name}</span>
                   </span>
                </div>
            ) : (
            <Link href="/login">
                <button className="px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-sm transition-all duration-300 hover:bg-white/10 hover:border-[#FFD700]/50 hover:text-[#FFD700] hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                    {t('login')}
                </button>
            </Link>
            )}

            <div className="w-9 h-9 rounded bg-[#FFD700] flex items-center justify-center cursor-pointer border border-transparent hover:border-white transition overflow-hidden">
                {user ? (
                     <div className="text-black font-bold text-lg">{user.name.charAt(0).toUpperCase()}</div>
                ) : (
                     <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" className="w-full h-full object-cover" />
                )}
            </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;