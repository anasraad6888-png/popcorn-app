"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 👈 أداة التنقل

const Navbar = () => {
  const [show, setShow] = useState(false); // للتحكم بخلفية الناف بار
  const [searchInput, setSearchInput] = useState(""); // 👈 لتخزين النص المكتوب
  const router = useRouter(); 

  // دالة تغيير الخلفية عند التمرير
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 👈 دالة البحث: تعمل عند ضغط Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    if (searchInput) {
      // توجيه المستخدم لصفحة البحث (التي سنصنعها لاحقاً)
      router.push(`/search/${searchInput}`);
      setSearchInput(""); // تفريغ المربع بعد البحث
    }
  };

  return (
    <nav className={`fixed top-0 w-full p-4 md:px-8 z-50 transition-all duration-300 ${show ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between">
        
        {/* اللوجو والقوائم */}
        <div className="flex items-center gap-8">
            {/* اللوجو: يعيدنا للصفحة الرئيسية */}
            <Link href="/">
               <h1 className="text-red-600 text-3xl font-bold cursor-pointer">NETFLIX<span className="text-white text-sm font-light ml-1">Clone</span></h1>
            </Link>

            <ul className="hidden md:flex gap-4 text-gray-300 text-sm">
                <li className="hover:text-white cursor-pointer transition">الرئيسية</li>
                <li className="hover:text-white cursor-pointer transition">أفلام</li>
                <li className="hover:text-white cursor-pointer transition">مسلسلات</li>
                <li className="hover:text-white cursor-pointer transition">الأحدث</li>
            </ul>
        </div>

        {/* الجزء الأيسر: البحث والصورة */}
        <div className="flex items-center gap-4">
            
            {/* 👈 نموذج البحث الجديد */}
            <form onSubmit={handleSearch} className="relative hidden md:block">
                <input 
                    type="text" 
                    placeholder="ابحث عن فيلم..." 
                    className="bg-black/40 border border-gray-500 rounded-full px-4 py-1 text-sm text-white focus:outline-none focus:border-white transition-all w-48 focus:w-64"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </form>

            <div className="w-8 h-8 bg-red-600 rounded cursor-pointer"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;