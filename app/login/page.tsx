"use client";

import { account } from '../appwrite'; 

// 2. استيراد OAuthProvider من المكتبة الأصلية (لأنها enum)
import { OAuthProvider } from 'appwrite'; 

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // دالة الدخول بالإيميل
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await account.createEmailPasswordSession(email, password);
      window.location.href = '/'; 
    } catch (error: any) {
      alert("خطأ في الدخول: " + error.message);
    }
  };

  // دالة الدخول بـ Google (تتطلب إعداداً مسبقاً في لوحة التحكم)
// دالة الدخول بـ Google
  const handleGoogleLogin = () => {
    try {
      account.createOAuth2Session(
          OAuthProvider.Google, // مزود الخدمة
          'http://localhost:3001', // رابط النجاح (Success URL) - يعيدك للرئيسية
          'http://localhost:3001/login' // رابط الفشل (Failure URL) - يبقيك في الدخول
      );
    } catch (error) {
      console.error("فشل الانتقال لجوجل", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="relative z-10 bg-black/75 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md mx-4">
        
        <h2 className="text-3xl font-bold text-white mb-8 text-right">تسجيل الدخول</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input 
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            placeholder="البريد الإلكتروني" 
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#e50914] transition-all placeholder-gray-400"
          />
          <input 
            onChange={(e) => setPassword(e.target.value)}
            type="password" 
            placeholder="كلمة المرور" 
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#e50914] transition-all placeholder-gray-400"
          />

          <button type="submit" className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold py-3.5 rounded-lg mt-4 
transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.7)]">
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-8">
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="h-px bg-gray-600 flex-1"></span>
                <span>أو تابع باستخدام</span>
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

        <div className="mt-8 text-right text-gray-400">
          جديد في الموقع؟ <Link href="/signup" className="text-white font-medium hover:underline ml-1">سجل الآن</Link>.
        </div>

      </div>
    </div>
  );
}