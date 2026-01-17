"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { account } from "@/app/appwrite"; 
import { useTranslations } from 'next-intl';
import { useSidebar } from "@/app/context/SidebarContext";
const Sidebar = () => {
  const t = useTranslations('Sidebar');
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  
  // 1. حالة للتحكم في الظهور
  const {isVisible, setIsVisible} = useSidebar();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems = [
    { name: t('home'), icon: <HomeIcon />, link: "/" },
    { name: t('trending'), icon: <FireIcon />, link: "/search/trending" },
    { name: t('movies'), icon: <FilmIcon />, link: "/search/movie" },
    { name: t('series'), icon: <TvIcon />, link: "/search/series" },
    { name: t('anime'), icon: <GhostIcon />, link: "/search/anime" },
    { name: t('favorites'), icon: <HeartIcon />, link: "/favorites" },
    { name: t('settings'), icon: <CogIcon />, link: "/settings" },
  ];

  // 2. منطق حركة الماوس والمؤقت
  useEffect(() => {
    const handleMouseMove = () => {
      setIsVisible(true);

      // إعادة تعيين المؤقت عند كل حركة
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000); // يختفي بعد 5 ثواني
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await account.get();
        setUser(session);
      } catch (error) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.href = '/'; 
    } catch (error) {
      console.error("فشل تسجيل الخروج", error);
    }
  };

  return (
    // التعديلات هنا:
    // - نستخدم transition-all duration-500 ease-in-out للنعومة
    // - في الموبايل: نستخدم translate-y لإخفاءه للأسفل
    // - في الكمبيوتر: نغير العرض (w-0 إلى w-14) لعمل إزاحة للمحتوى (Displacement)
    // - overflow-hidden: ضروري جداً لكي لا يظهر المحتوى عندما يكون العرض 0
<div 
      className={`
        {/* 👇 1. حذفنا overflow-hidden من هنا */}
        fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0c] border-t border-gray-800 flex flex-row justify-around items-center py-0 shrink-0
        transition-all duration-500 ease-in-out
        
        md:fixed md:top-0 md:start-0 md:h-screen md:flex-col md:justify-between md:border-t-0 md:border-l md:py-8
        
        {/* 👇 2. التحكم الذكي في الـ overflow */}
        {/* في الموبايل أو عند الإغلاق: مخفي. في الكمبيوتر عند الفتح: مرئي للسماح بظهور التلميحات */}
        ${isVisible ? 'md:overflow-visible overflow-hidden' : 'overflow-hidden'}

        {/* باقي الكلاسات كما هي */}
        ${isVisible ? 'h-16 translate-y-0 opacity-100' : 'h-0 translate-y-full opacity-0 md:translate-y-0 md:h-screen'}
        ${isVisible ? 'md:w-14 opacity-100' : 'md:w-0 opacity-0'}
      `}
    >
      
      {/* 1. القائمة العلوية */}
      <div className="flex flex-row w-full justify-around items-center md:flex-col md:gap-5">
        {menuItems.map((item, index) => {
          
          // 👇 المنطق الجديد:
          // نحدد الصفحات التي تتطلب تسجيل دخول
          const protectedRoutes = ['/settings'];
          
          // إذا كانت الصفحة محمية والمستخدم غير مسجل، نغير الرابط إلى /login
          const destination = (protectedRoutes.includes(item.link) && !user) 
            ? "/login" 
            : item.link;

          return (
            <Link href={destination} key={index} className="relative group w-auto md:w-full flex justify-center">
              
              {/* الأيقونة */}
              <div className="p-2 md:p-3 rounded-xl text-gray-400 group-hover:text-[#FFD700] transition-all duration-300">
                <div className="[&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-7 md:[&>svg]:h-7">
                  {item.icon}
                </div>
              </div>

              {/* التلميح (Tooltip) */}
              <span className="hidden md:block absolute top-1/2 -translate-y-1/2 bg-white text-black text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.3)] whitespace-nowrap pointer-events-none z-50 ltr:left-[120%] rtl:right-[120%] ltr:-translate-x-2 rtl:translate-x-2 group-hover:translate-x-0">
                {item.name}
                {/* إضافة ملاحظة صغيرة في التلميح إذا لم يكن مسجلاً (اختياري) */}
                {!user && protectedRoutes.includes(item.link) && (
                    <span className="block text-[10px] text-red-500 font-normal">
                        ({t('login') || 'Login required'})
                    </span>
                )}
                <span className="absolute top-1/2 -translate-y-1/2 border-4 border-transparent ltr:-left-1 ltr:border-r-white rtl:-right-1 rtl:border-l-white"></span>
              </span>

            </Link>
          );
        })}
      </div>

      {/* 2. زر تسجيل الخروج */}
      <div className="hidden md:flex flex-col items-center w-full border-t border-gray-800 pt-6">
         <button 
            onClick={user ? handleLogout : undefined}
            disabled={!user} 
            className={`relative group w-full flex justify-center transition-all duration-300 ${!user ? 'opacity-30 cursor-not-allowed' : ''}`}
         >
            {/* أيقونة الخروج: أيضاً تصبح صفراء عند التحويم */}
            <div className={`p-3 rounded-xl transition-all duration-300 ${user ? 'text-red-600 hover:bg-red-600/10 hover:text-red-500' : 'text-gray-500'}`}>
              <LogoutIcon />
            </div>

            {user && (
                <span className="absolute right-[120%] top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-[0_0_10px_rgba(220,38,38,0.5)] whitespace-nowrap pointer-events-none z-50">
                  تسجيل الخروج
                  <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-red-600"></span>
                </span>
            )}
         </button>
      </div>

    </div>
  );
};

export default Sidebar;

// الأيقونات (بقيت كما هي)
const LogoutIcon = () => (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>);
const HomeIcon = () => (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>);
const FireIcon = () => (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>);
const FilmIcon = () => (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 19.002 6 18.375m-3.75 1.125V18m0-1.125h17.25V3.375H3.375m3.75 13.5h10.5m-10.5 0v-13.5m0 13.5h-1.5c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h1.5m0 3.75V4.875c0-.621-.504-1.125-1.125-1.125h-1.5m14.25 13.5h1.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5m0 3.75V4.875c0-.621.504-1.125 1.125-1.125h1.5M16.5 18v-1.125c0-.621-.504-1.125-1.125-1.125h-1.5m3.75 2.25H12m1.125-2.25h-4.5m0 2.25H6" /></svg>);
const TvIcon = () => (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" /></svg>);
const GhostIcon = () => (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>);
const HeartIcon = () => (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>);
const CogIcon = () => (<svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);