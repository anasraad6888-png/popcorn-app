"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// 1. استيراد account من ملف إعدادات Appwrite
import { account, avatars } from '../app/appwrite'; 

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
}

const Navbar = () => {
  const [avatarUrl, setAvatarUrl] = useState(""); // 👈 متغير جديد للصورة
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 2. حالة لتخزين بيانات المستخدم
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // 3. دالة لجلب بيانات المستخدم عند تحميل الناف بار
useEffect(() => {
    const getUserData = async () => {
      try {
        const sessionUser = await account.get();
        setUser(sessionUser);


        const url = avatars.getInitials(sessionUser.name).toString();
        setAvatarUrl(url);

      } catch (error) {
        setUser(null);
        setAvatarUrl("");
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
          const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}&language=ar-SA&include_adult=false`;
          const req = await fetch(url);
          const data = await req.json();
          
          if (data.results) {
            setResults(data.results.slice(0, 5));
          }
        } catch (error) {
          console.error("خطأ في البحث:", error);
        } finally {
          setLoading(false);
        }
      }, 500);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [query, API_KEY]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/search/${query}`);
      setShowDropdown(false);
    }
  };

  return (
<nav className={`fixed top-0 left-0 right-0 md:right-20 w-full md:w-[calc(100%-5rem)] p-4 md:px-8 z-40 transition-all duration-300 ${show ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>      <div className="flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-8">
<Link href="/">
    <img 
        src="/logo.png" 
        alt="Logo" 
        className="w-32 h-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-200" 
    />
</Link>
            <ul className="hidden md:flex gap-4 text-gray-300 text-sm">
                <Link href="/"><li className="hover:text-white cursor-pointer transition">الرئيسية</li></Link>
                <li className="hover:text-white cursor-pointer transition">أفلام</li>
                <li className="hover:text-white cursor-pointer transition">مسلسلات</li>
            </ul>
        </div>

        {/* منطقة البحث */}
        <div className="relative flex-1 max-w-lg mx-4">
            <form onSubmit={handleSubmit} className="relative w-full">
                <input 
                    type="text" 
                    placeholder="ابحث عن فيلم أو مسلسل..." 
                    className="w-full bg-[#2b2b2b] text-white text-sm rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all border border-transparent focus:border-transparent placeholder-gray-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onFocus={() => query.length > 2 && setShowDropdown(true)}
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                </button>
            </form>

            {/* القائمة المنسدلة للبحث */}
            {showDropdown && (query.length > 2) && (
                <div className="absolute top-12 right-0 w-full bg-[#1f1f1f] rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-[60]">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">جاري البحث...</div>
                    ) : results.length > 0 ? (
                        <>
                            {results.map((item) => (
                                item.poster_path && (
                                    <Link key={item.id} href={`/movie/${item.id}?type=${item.media_type}`} onClick={() => setQuery("")}>
                                        <div className="flex gap-4 p-3 hover:bg-[#333] transition cursor-pointer border-b border-gray-800 last:border-0 group">
                                            <img 
                                                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} 
                                                alt={item.title || item.name} 
                                                className="w-12 h-16 object-cover rounded bg-gray-800"
                                            />
                                            <div className="flex flex-col justify-center flex-1">
                                                <h4 className="text-white font-bold text-sm group-hover:text-yellow-500 transition line-clamp-1">
                                                    {item.title || item.name}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                    <span className="text-yellow-500 font-bold">⭐ {item.vote_average?.toFixed(1)}</span>
                                                    <span>📅 {(item.release_date || item.first_air_date || "").split("-")[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            ))}
                        </>
                    ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">لا توجد نتائج مطابقة</div>
                    )}
                </div>
            )}
        </div>

        {/* 4. زر الدخول أو اسم المستخدم */}
        <div className="flex items-center gap-4 shrink-0"> 
            
            {user ? (
                // إذا كان المستخدم مسجل دخول، اعرض اسمه
                <div className="flex items-center gap-3">
                   <span className="text-white font-medium text-sm">
                     مرحباً، <span className="text-yellow-500 font-bold">{user.name}</span>
                   </span>
                </div>
            ) : (
                // إذا لم يكن مسجلاً، اعرض زر الدخول
                <Link href="/login">
                    <button className="text-white text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 hover:bg-white hover:text-black">
                        تسجيل الدخول
                    </button>
                </Link>
            )}

{/* أيقونة الملف الشخصي */}
        <div className="w-9 h-9 rounded-full bg-yellow-600 flex items-center justify-center cursor-pointer border border-transparent hover:border-white transition overflow-hidden">
             {user && avatarUrl ? (
                 // إذا كان هناك مستخدم، اعرض صورته المولدة (الأحرف الأولى)
                 <img 
                    src={avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                 />
             ) : (
                 // إذا لم يوجد مستخدم، اعرض صورة نتفليكس الافتراضية
                 <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" 
                    alt="User" 
                    className="w-full h-full object-cover"
                 />
             )}
        </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;