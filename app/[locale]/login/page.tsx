"use client";

import { account } from '@/app/appwrite';
import { OAuthProvider } from 'appwrite'; 
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // حالات الخطأ والنجاح
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // رسالة نجاح الإرسال
  
  const router = useRouter();

  // دالة تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    setSuccessMsg('');

    try {
      await account.createEmailPasswordSession(email, password);
      window.location.href = '/'; 
    } catch (err: any) {
      const rawMessage = err.message || ""; 

      if (rawMessage.includes("Invalid credentials") || rawMessage.includes("401")) {
        setError(t('errors.invalid_credentials'));
      } else if (
          rawMessage.includes("password") && 
          (rawMessage.includes("between 8 and 256") || rawMessage.includes("Invalid `password` param"))
      ) {
        setError(t('errors.password_short'));
      } else if (
          rawMessage.includes("email") || rawMessage.includes("Invalid `email` param")
      ) {
        setError(t('errors.email_invalid'));
      } else {
        setError(t('errors.general_error'));
        console.error(rawMessage); 
      }
    }
  };

  // 👇 دالة استعادة كلمة المرور الجديدة
  const handleRecovery = async () => {
    setError('');
    setSuccessMsg('');

    // 1. يجب أن يكون الإيميل مكتوباً
    if (!email) {
        setError(t('errors.email_required_recovery'));
        return;
    }

    try {
        // 2. إرسال طلب الاستعادة لـ Appwrite
        // ملاحظة: الرابط الثاني هو الصفحة التي سيتوجه لها المستخدم عند ضغط الرابط في الإيميل
        // سنفترض حالياً أنها الصفحة الرئيسية حتى تقوم بإنشاء صفحة خاصة للاستعادة
        await account.createRecovery(email, 'http://localhost:3000/reset-password'); 
        
        // 3. إظهار رسالة نجاح
        setSuccessMsg(t('recovery_sent'));
    } catch (err: any) {
        // التعامل مع الأخطاء (مثل الإيميل غير صحيح)
        setError(err.message); 
    }
  };

  // دالة الدخول بـ Google
  const handleGoogleLogin = () => {
    try {
      account.createOAuth2Session(
          OAuthProvider.Google,
          'http://localhost:3000', 
          'http://localhost:3000/login'
      );
    } catch (error) {
      console.error("فشل الانتقال لجوجل", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="relative z-10 bg-black/75 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md mx-4">
        
        <h2 className="text-3xl font-bold text-white mb-8 text-start">{t('title')}</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input 
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            placeholder={t('email_placeholder')}
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
          />
          
          <div className="flex flex-col gap-2">
            <input 
                onChange={(e) => setPassword(e.target.value)}
                type="password" 
                placeholder={t('password_placeholder')}
                className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
            />
            {/* 👇 زر نسيان كلمة المرور */}
            <button 
                type="button" 
                onClick={handleRecovery}
                className="text-xs text-gray-400 hover:text-white hover:underline text-end transition-colors w-fit self-end"
            >
                {t('forgot_password')}
            </button>
          </div>

          {/* عرض رسالة الخطأ */}
          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded border border-red-500/20 text-start animate-pulse flex items-center gap-2">
               ⚠️ {error}
            </div>
          )}

          {/* عرض رسالة النجاح (للإيميل) */}
          {successMsg && (
            <div className="text-green-500 text-sm font-bold bg-green-500/10 p-3 rounded border border-green-500/20 text-start animate-pulse flex items-center gap-2">
               ✅ {successMsg}
            </div>
          )}

          <button type="submit" className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold py-3.5 rounded-lg mt-2 
            transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.7)]">
            {t('submit_button')}
          </button>
        </form>

        <div className="mt-8">
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="h-px bg-gray-600 flex-1"></span>
                <span>{t('or_continue')}</span>
                <span className="h-px bg-gray-600 flex-1"></span>
            </div>
            
            <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2.5 rounded-lg transition-all duration-300 group"
            >
                <FaGoogle className="text-yellow-500 group-hover:scale-110 transition-transform" /> 
                <span className="text-sm">Google</span>
            </button>
        </div>

        <div className="mt-8 text-start text-gray-400">
          {t('new_user')} <Link href="/signup" className="text-white font-medium hover:underline mx-1">{t('signup_link')}</Link>.
        </div>

      </div>
    </div>
  );
}