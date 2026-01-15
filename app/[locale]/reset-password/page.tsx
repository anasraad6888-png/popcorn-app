"use client";

import { account } from '@/app/appwrite';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ResetPasswordPage() {
  const t = useTranslations('ResetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // استخراج البيانات السرية من الرابط القادم من الإيميل
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. التحقق من تطابق الكلمتين
    if (password !== confirmPassword) {
      setError(t('error_mismatch'));
      return;
    }

    // 2. التحقق من صلاحية الرابط
    if (!userId || !secret) {
      setError(t('error_missing_params'));
      return;
    }

    try {
      // 3. إرسال الطلب النهائي لـ Appwrite
      await account.updateRecovery(
        userId, 
        secret, 
        password, 
        confirmPassword 
      );
      
      setSuccess(t('success_msg'));

      // 4. التوجيه لصفحة الدخول بعد ثانيتين
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message || t('general_error'));
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      <div className="relative z-10 bg-black/75 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md mx-4">
        
        <h2 className="text-3xl font-bold text-white mb-8 text-start">{t('title')}</h2>

        <form onSubmit={handleReset} className="flex flex-col gap-5">
          
          {/* كلمة المرور الجديدة */}
          <input 
            onChange={(e) => setPassword(e.target.value)}
            type="password" 
            placeholder={t('new_password_placeholder')}
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
            required
            minLength={8}
          />

          {/* تأكيد كلمة المرور */}
          <input 
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password" 
            placeholder={t('confirm_password_placeholder')}
            className="w-full bg-[#333] text-white px-5 py-4 rounded-lg outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-[#d3e509] transition-all placeholder-gray-400"
            required
            minLength={8}
          />

          {/* رسائل الخطأ */}
          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded border border-red-500/20 text-start animate-pulse flex items-center gap-2">
               ⚠️ {error}
            </div>
          )}

          {/* رسالة النجاح */}
          {success && (
            <div className="text-green-500 text-sm font-bold bg-green-500/10 p-3 rounded border border-green-500/20 text-start animate-pulse flex items-center gap-2">
               ✅ {success}
            </div>
          )}

          <button type="submit" className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold py-3.5 rounded-lg mt-4 
            transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.7)]">
            {t('submit_button')}
          </button>
        </form>

      </div>
    </div>
  );
}