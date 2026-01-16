"use client";

import React, { useEffect, useState, useRef } from 'react';
import { account, storage, ID } from '@/app/appwrite'; 
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const router = useRouter();

  // ضع هنا معرف الـ Bucket الذي أنشأته في Appwrite
  const BUCKET_ID = '696a3bb00027ac5ddf45'; 

  const [user, setUser] = useState<any>(null);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // حالة الصورة
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👇 حالة جديدة: التحكم في ظهور نافذة تأكيد الحذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // حالة تحميل خاصة بزر الحذف النهائي

  // 1. جلب البيانات
  useEffect(() => {
    const getData = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        setNewName(currentUser.name);
        
        if (currentUser.prefs && currentUser.prefs.avatarId) {
             const filePreview = storage.getFileView(BUCKET_ID, currentUser.prefs.avatarId);
             setAvatarUrl(filePreview.toString());
        }
      } catch (error) {
        // ...
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [router]);

  // 2. تحديث الاسم
  const handleUpdateProfile = async () => {
    setMsg({ type: '', text: '' });
    if (!newName.trim()) {
        setMsg({ type: 'error', text: t('error_empty_name') });
        return;
    }
    try {
      await account.updateName(newName);
      setMsg({ type: 'success', text: t('success_update') });
      setUser({ ...user, name: newName });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMsg({ type: 'error', text: t('error_update') });
    }
  };

  // 3. رفع الصورة
  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        setMsg({ type: 'error', text: t('error_image_size') });
        return;
    }

    setUploadingImg(true);
    setMsg({ type: '', text: '' });

    try {
        const oldAvatarId = user?.prefs?.avatarId;
        const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const currentPrefs = user.prefs || {};
        await account.updatePrefs({ ...currentPrefs, avatarId: uploadedFile.$id });

        setUser((prev: any) => ({
            ...prev,
            prefs: { ...prev.prefs, avatarId: uploadedFile.$id }
        }));

        const fileView = storage.getFileView(BUCKET_ID, uploadedFile.$id);
        setAvatarUrl(fileView.toString());
        setMsg({ type: 'success', text: t('success_update') });

        if (oldAvatarId) {
            try { await storage.deleteFile(BUCKET_ID, oldAvatarId); } catch (e) {}
        }

    } catch (error: any) {
        setMsg({ type: 'error', text: t('error_update') });
    } finally {
        setUploadingImg(false);
        setTimeout(() => window.location.reload(), 1000);
    }
  };

  // 4. دالة حذف الصورة الشخصية
  const handleDeleteAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!user?.prefs?.avatarId) return;
    setMsg({ type: '', text: '' });

    try {
        await storage.deleteFile(BUCKET_ID, user.prefs.avatarId);
        const newPrefs = { ...user.prefs };
        delete newPrefs.avatarId; 
        await account.updatePrefs(newPrefs);
        setUser((prev: any) => ({ ...prev, prefs: newPrefs }));
        setAvatarUrl(null); 
        setMsg({ type: 'success', text: locale === 'ar' ? 'تم حذف الصورة بنجاح' : 'Avatar deleted' });
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        setMsg({ type: 'error', text: t('error_update') });
    }
  };

  // 5. دالة تنفيذ الحذف النهائي (تُستدعى من داخل النافذة)
  const executeDeleteAccount = async () => {
      setIsDeleting(true);

      try {
         // حذف الصورة
         if (user?.prefs?.avatarId) {
             try { await storage.deleteFile(BUCKET_ID, user.prefs.avatarId); } catch (e) {}
         }

         // استدعاء API الحذف
         const response = await fetch('/api/deleteAccount', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ userId: user.$id }) 
         });

         if (!response.ok) throw new Error('Failed to delete account');

         try { await account.deleteSession('current'); } catch (e) {}
         
         window.location.href = '/login';

      } catch (error: any) {
         console.error(error);
         alert(t('error_update')); // هنا يمكن إبقاء alert للخطأ فقط أو استبداله برسالة
         setIsDeleting(false);
         setShowDeleteModal(false); // إغلاق النافذة
      }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      window.location.href = '/';
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="min-h-screen bg-[#141414] flex items-center justify-center text-white">{t('loading')}</div>;

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6 md:p-12 md:ps-24 pt-24 md:pt-20 relative">
      
       <div className="flex items-end gap-4 mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
             <span className="w-2 h-10 bg-[#FFD700] rounded-full shadow-[0_0_15px_#FFD700]"></span>
             {t('title')}
          </h1>
       </div>

      <div className="max-w-2xl mx-auto md:mx-0 flex flex-col gap-8">
        
        {/* === القسم 1: الملف الشخصي === */}
        <div className="bg-[#1f1f1f] p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-6 mb-8">
             <div className="relative">
                 <div 
                    onClick={handleImageClick}
                    className="relative w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity overflow-hidden group border-2 border-[#FFD700]"
                 >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span>{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
                    </div>
                 </div>
                 {avatarUrl && (
                     <button onClick={handleDeleteAvatar} className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg border-2 border-[#1f1f1f] transition-all z-20">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.53 6.19a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>
                     </button>
                 )}
             </div>
             
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

             <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                {uploadingImg && <span className="text-[#FFD700] text-xs animate-pulse">{t('uploading')}</span>}
             </div>
          </div>

          <div className="space-y-6">
             <div>
                <label className="block text-gray-400 text-sm mb-2">{t('email_label')}</label>
                <input type="text" value={user?.email} disabled className="w-full bg-[#141414] text-gray-500 p-4 rounded-lg border border-gray-700 cursor-not-allowed"/>
             </div>
             <div>
                <label className="block text-gray-400 text-sm mb-2">{t('name_label')}</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-[#2b2b2b] text-white p-4 rounded-lg outline-none focus:border-[#FFD700] border border-transparent transition-all placeholder-gray-500" placeholder={t('name_label')}/>
             </div>

             {msg.text && (
               <div className={`p-3 rounded text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                 {msg.text}
               </div>
             )}

             <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button onClick={handleUpdateProfile} className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold py-3 px-6 rounded-lg transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]">
                  {t('update_btn')}
                </button>
                <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-6 rounded-lg transition-all">
                  {t('logout')}
                </button>
             </div>
          </div>
        </div>

        {/* === القسم 2: منطقة الخطر (حذف الحساب) === */}
        <div className="border border-red-500/30 bg-red-500/5 p-8 rounded-2xl shadow-xl">
           <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
             ⚠️ {t('danger_zone')}
           </h2>
           
           <p className="text-gray-400 text-sm mb-6 leading-relaxed">
             {t('delete_account_desc')}
           </p>

           <button 
             onClick={() => setShowDeleteModal(true)} // 👈 فتح النافذة بدلاً من الحذف المباشر
             className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600 font-bold py-3 px-6 rounded-lg transition-all duration-300"
           >
             {t('delete_btn')}
           </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* =============== نافذة التأكيد (Custom Modal) ============= */}
      {/* ========================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* الخلفية المظلمة */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={() => !isDeleting && setShowDeleteModal(false)}
            ></div>

            {/* صندوق الحوار */}
            <div className="relative bg-[#1f1f1f] border border-red-500/30 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                        {locale === 'ar' ? 'هل أنت متأكد من حذف الحساب؟' : 'Delete Account Permanently?'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        {locale === 'ar' 
                            ? 'سيتم حذف جميع بياناتك نهائياً ولن تتمكن من استعادتها مرة أخرى. هل تريد المتابعة؟'
                            : 'This action cannot be undone. All your data will be permanently removed. Are you sure?'}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            disabled={isDeleting}
                            className="flex-1 py-3 rounded-lg font-bold bg-gray-700 hover:bg-gray-600 text-white transition disabled:opacity-50"
                        >
                            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button 
                            onClick={executeDeleteAccount}
                            disabled={isDeleting}
                            className="flex-1 py-3 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {locale === 'ar' ? 'حذف نهائي' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}