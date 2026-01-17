"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { account, storage } from '../app/appwrite'; // 👈 1. تأكد من استيراد storage
import { useTranslations, useLocale } from 'next-intl';
import { useSidebar } from "@/app/context/SidebarContext";

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
  const locale = useLocale(); 
  const router = useRouter();
  const pathname = usePathname();
  const { isVisible: isSidebarVisible } = useSidebar();

  // نفس الـ Bucket ID المستخدم في صفحة الإعدادات
  const BUCKET_ID = '696a3bb00027ac5ddf45'; // 👈 2. تأكد أن هذا هو الرقم الصحيح

  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // 👈 3. حالة جديدة للصورة

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
      console.error("فشل تسجيل الخروج", error);
    }
  };

  // 4. تعديل دالة جلب البيانات لتشمل الصورة
  useEffect(() => {
    const getUserData = async () => {
      try {
        const sessionUser = await account.get();
        setUser(sessionUser);

        // التحقق من وجود صورة في التفضيلات
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

  // ... (باقي كود البحث والـ Scroll كما هو بدون تغيير) ...
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

        {/* البحث (نفس الكود القديم) */}
        <div className="relative flex-1 max-w-lg mx-2 md:mx-4">          
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
                <button type="submit" className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</button>
            </form>
            {showDropdown && (query.length > 2) && (
                <div className="absolute top-12 start-0 w-full bg-[#1f1f1f] rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-[60]">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">{t('searching')}</div>
                    ) : results.length > 0 ? (
                        results.map((item) => item.poster_path && (
                           <Link key={item.id} href={`/watch/${item.id}?type=${item.media_type}`} onClick={() => setQuery("")}>
                               <div className="flex gap-4 p-3 hover:bg-[#333] transition cursor-pointer border-b border-gray-800 last:border-0 group">
                                   <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} className="w-12 h-16 object-cover rounded bg-gray-800"/>
                                   <div className="flex flex-col justify-center flex-1">
                                       <h4 className="text-white font-bold text-sm group-hover:text-[#FFD700] transition line-clamp-1 text-start">{item.title || item.name}</h4>
                                       <span className="text-yellow-500 text-xs font-bold mt-1">⭐ {item.vote_average?.toFixed(1)}</span>
                                   </div>
                               </div>
                           </Link>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">{t('no_results')}</div>
                    )}
                </div>
            )}
        </div>

        {/* القسم الأيمن */}
        <div className="relative flex items-center gap-4 shrink-0"> 
            
            {/* نسخة الكمبيوتر */}
            <div className="hidden md:flex items-center gap-4">
                <button onClick={switchLanguage} className="flex items-center justify-center border border-gray-600 hover:border-[#FFD700] text-gray-300 hover:text-[#FFD700] px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300">
                    {locale === 'ar' ? 'English' : 'العربية'}
                </button>

                {user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-white font-medium text-sm">
                            {t('welcome')} <span className="text-[#FFD700] font-bold">{user.name}</span>
                        </span>
                        
                        {/* 👈 5. عرض الصورة أو الحرف */}
{/* 👈 5. عرض الصورة أو الحرف */}
                        <div className="w-9 h-9 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold text-lg overflow-hidden border border-[#FFD700] shadow-md">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                            ) : (
                                /* تحسين: التأكد من وجود الاسم وعرض الحرف الأول أو U كبديل */
                                <span>
                                    {user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
                                </span>
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
                            {/* 👈 عرض الصورة في قائمة الموبايل أيضاً */}
                            <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold text-lg overflow-hidden border border-[#FFD700]">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>
                                        {user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
                                    </span>
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