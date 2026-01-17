"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { account, databases, Query, DATABASE_ID, COLLECTION_ID_MYLIST } from '@/app/appwrite'; // تأكد من المسار الصحيح لملف appwrite
import { useTranslations } from 'next-intl'; // 1. استيراد هوك الترجمة

// تعريف شكل البيانات القادمة من Appwrite
interface FavoriteItem {
  $id: string; 
  tmdbId: string;
  poster_path: string;
  title: string;
  vote_average: number;
  release_date?: string;
  media_type: string;
}

const FavoritesPage = () => {
  const t = useTranslations('Favorites'); // 2. تفعيل الترجمة
  
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID_MYLIST,
          [Query.equal('userId', currentUser.$id)]
        );

        const items = response.documents.map((doc: any) => ({
          $id: doc.$id,
          tmdbId: doc.tmdbId,
          poster_path: doc.poster_path,
          title: doc.title,
          vote_average: doc.vote_average,
          release_date: doc.release_date,
          media_type: doc.media_type
        }));

        setFavorites(items);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const removeFromList = async (e: React.MouseEvent, docId: string) => {
    e.preventDefault(); 
    // استخدام الترجمة في رسالة التأكيد
    if(!confirm(t('remove_confirm'))) return;

    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MYLIST, docId);
        setFavorites(prev => prev.filter(item => item.$id !== docId));
    } catch (error) {
        alert(t('remove_error'));
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#141414] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white gap-4">
          <h2 className="text-2xl font-bold">{t('login_required')}</h2>
          <Link href="/login">
            <button className="bg-[#FFD700] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#FFC000] transition">
                {t('login_button')}
            </button>
          </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6 md:p-12 pl-4 md:pl-20 md:pt-24 pt-24">
       
       {/* العنوان */}
       <div className="flex items-end gap-4 mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
             <span className="w-2 h-10 bg-[#FFD700] rounded-full shadow-[0_0_15px_#FFD700]"></span>
             {t('title')}
          </h1>
          <span className="text-gray-400 text-lg mb-1">{favorites.length} {t('works_count')}</span>
       </div>

       {favorites.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mb-4 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
               </svg>
               <p className="text-xl">{t('empty_list')}</p>
               <Link href="/" className="mt-4 text-[#FFD700] hover:underline">{t('browse_now')}</Link>
           </div>
       ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
               {favorites.map((item) => (
                   <div key={item.$id} className="relative group">
                       {/* إضافة type للرابط لضمان فتح الصفحة بشكل صحيح */}
                       <Link href={`/watch/${item.tmdbId}?type=${item.media_type}`}>
                           <div className="relative rounded-xl overflow-hidden border-2 border-transparent group-hover:border-[#FFD700] transition-all duration-300 group-hover:scale-105 cursor-pointer shadow-lg bg-[#1f1f1f] aspect-[2/3]">
                               
                               <img
                                   src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                   alt={item.title}
                                   className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-500"
                               />
                               
                               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                                   <h3 className="font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                                   <div className="flex items-center gap-2 text-sm">
                                       <span className="bg-[#FFD700] text-black px-2 py-0.5 rounded font-bold text-xs">IMDb {item.vote_average?.toFixed(1)}</span>
                                       <span className="text-gray-300 text-xs">{(item.release_date || "").split("-")[0]}</span>
                                   </div>
                                   <div className="mt-4 bg-[#FFD700] text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                        </svg>
                                        {t('play')}
                                   </div>
                               </div>

                               <button 
                                  onClick={(e) => removeFromList(e, item.$id)}
                                  className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all shadow-lg z-20"
                                  title={t('remove_title')}
                               >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                  </svg>
                               </button>

                           </div>
                       </Link>
                   </div>
               ))}
           </div>
       )}
    </div>
  );
};

export default FavoritesPage;