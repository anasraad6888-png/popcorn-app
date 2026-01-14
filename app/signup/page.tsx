"use client";

import { account } from '../appwrite';

// 2. استيراد ID من المكتبة الأصلية (لتوليد أرقام عشوائية)
import { ID } from 'appwrite';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        // 1. إنشاء الحساب في Appwrite
        // الترتيب: (ID, Email, Password, Name)
        await account.create(ID.unique(), email, password, name);

        // 2. تسجيل الدخول مباشرة بعد الإنشاء (اختياري لكن مفضل)
        await account.createEmailPasswordSession(email, password);

        // 3. التوجيه للصفحة الرئيسية
        router.push('/');

    } catch (error: any) {
        console.error(error);
        alert("فشل إنشاء الحساب: " + error.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="relative z-10 bg-black/75 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md mx-4 my-10">
        
        <h2 className="text-3xl font-bold text-white mb-2 text-right">إنشاء حساب جديد</h2>
        
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input 
            onChange={(e) => setName(e.target.value)}
            type="text" 
            placeholder="الاسم الكامل" 
            className="w-full bg-[#333] text-white px-5 py-3.5 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#e50914] transition-all placeholder-gray-400"
          />
          <input 
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            placeholder="البريد الإلكتروني" 
            className="w-full bg-[#333] text-white px-5 py-3.5 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#e50914] transition-all placeholder-gray-400"
          />
          <input 
            onChange={(e) => setPassword(e.target.value)}
            type="password" 
            placeholder="كلمة المرور" 
            className="w-full bg-[#333] text-white px-5 py-3.5 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#e50914] transition-all placeholder-gray-400"
          />
<button type="submit" className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold py-3.5 rounded-lg mt-4 
transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.7)]">
  إنشاء الحساب
</button>
        </form>

        <div className="mt-6 text-right text-gray-400">
          لديك حساب بالفعل؟ <Link href="/login" className="text-white font-medium hover:underline ml-1">تسجيل الدخول</Link>.
        </div>
      </div>
    </div>
  );
}