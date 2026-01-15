"use client";

import { account, ID } from '@/app/appwrite';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignupPage() {
  const t = useTranslations('Signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 1. حالة جديدة لتخزين الخطأ
  const [error, setError] = useState(''); 
  
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // مسح أي خطأ سابق عند المحاولة الجديدة

    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      window.location.href = '/';
      
    } catch (err: any) {
      // 2. بدلاً من alert، نضع الرسالة في الـ State
      // قمنا بإزالة البادئة التقنية لجعل الرسالة أوضح
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="relative z-10 bg-black/75 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md mx-4">
        
        <h2 className="text-3xl font-bold text-white mb-8 text-start">{t('title')}</h2>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          
          <input 
            onChange={(e) => setName(e.target.value)}
            type="text" 
            placeholder={t('name_placeholder')}
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
          />

          <input 
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            placeholder={t('email_placeholder')}
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
          />

          <input 
            onChange={(e) => setPassword(e.target.value)}
            type="password" 
            placeholder={t('password_placeholder')}
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
          />

          {/* 3. مكان ظهور رسالة الخطأ */}
          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded border border-red-500/20 text-start animate-pulse">
               ⚠️ {t('signup_error')} {error}
            </div>
          )}

          <button type="submit" className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold py-3.5 rounded-lg mt-2 
            transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.7)]">
            {t('submit_button')}
          </button>
        </form>

        <div className="mt-8 text-start text-gray-400">
          {t('existing_user')} <Link href="/login" className="text-white font-medium hover:underline mx-1">{t('login_link')}</Link>.
        </div>

      </div>
    </div>
  );
}