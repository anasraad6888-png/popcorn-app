"use client";

import { account, ID } from '@/app/appwrite';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignupPage() {
  const t = useTranslations('Signup');
  const router = useRouter();

  // 1. تعريف المتغيرات الجديدة (تأكيد الباسورد + حالة ظهور العين)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👁️ للباسورد الأول

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 👁️ لتأكيد الباسورد
  
  const [error, setError] = useState(''); 

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 

    // 2. التحقق من تطابق كلمتي المرور قبل الإرسال
    if (password !== confirmPassword) {
        setError(t('password_match_error')); // مفتاح الترجمة الذي أضفته أنت
        return;
    }

    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      window.location.href = '/';
      
    } catch (err: any) {
      const rawMessage = err.message || ""; 

      if (rawMessage.includes("password")) {
        setError(t('errors.password_short'));
      } else if (rawMessage.includes("valid email") || rawMessage.includes("Invalid `email`")) {
        setError(t('errors.email_invalid'));
      } else if (rawMessage.includes("name") || rawMessage.includes("Invalid `name`")) {
        setError(t('errors.name_invalid'));
      } else if (rawMessage.includes("already exists") || err.code === 409) {
        setError(t('errors.user_exists'));
      } else {
        setError(t('errors.general_error'));
        console.error(rawMessage);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center 
    justify-center bg-[url('/background.jpeg')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="relative z-10 bg-black/75 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md mx-4">
        
        <h2 className="text-3xl font-bold text-white mb-8 text-start">{t('title')}</h2>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          
          {/* الاسم */}
          <input 
            onChange={(e) => setName(e.target.value)}
            type="text" 
            placeholder={t('name_placeholder')}
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
          />

          {/* البريد الإلكتروني */}
          <input 
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            placeholder={t('email_placeholder')}
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
          />

          {/* كلمة المرور مع زر العين */}
          <div className="relative">
              <input 
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"} // تبديل النوع
                placeholder={t('password_placeholder')}
                className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400 pe-12" // pe-12 لترك مساحة للأيقونة
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-4 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
          </div>

          {/* 3. حقل تأكيد كلمة المرور الجديد */}
          <div className="relative">
              <input 
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('confirm_password_placeholder')} // مفتاح الترجمة الذي أضفته
                className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400 pe-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-4 text-gray-400 hover:text-white transition"
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
          </div>

          {/* رسائل الخطأ */}
          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded border border-red-500/20 text-start animate-pulse flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                 <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
               </svg>
               {error}
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

// --- مكونات الأيقونات (SVG Icons) ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);