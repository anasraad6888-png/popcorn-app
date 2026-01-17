"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import VideoPlayer from '@/components/VideoPlayer';
import Link from 'next/link';
import { account } from '@/app/appwrite';

// --- 1. تعريف الواجهات (Interfaces) ---
interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface Similar {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  media_type?: string;
}

interface MediaDetails {
  title?: string;
  name?: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genres: { id: number; name: string }[];
}

// بيانات السيرفرات (كما هي)
const SERVERS = [
  { id: 1, name: "Server 1 (Fast)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: 2, name: "Server 2 (Backup)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: 3, name: "Server 3 (4K)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
];

interface Comment {
  id: number;
  user: string;
  text: string;
  date: string;
}

export default function PlayerPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'movie'; // الحصول على النوع (فيلم/مسلسل)
  
  const locale = useLocale();
  const t = useTranslations('Watch'); 
  const isAr = locale === 'ar';
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // --- حالات البيانات ---
  const [currentServer, setCurrentServer] = useState(SERVERS[0]);
  const [user, setUser] = useState<any>(null);
  
  // بيانات TMDB الجديدة
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<Similar[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // حالات التعليقات
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: "Ahmed Ali", text: "Best movie ever! 🔥", date: "2 mins ago" },
    { id: 2, user: "Sarah", text: "النهاية كانت صادمة جداً 😱", date: "1 hour ago" },
  ]);
  const [newComment, setNewComment] = useState("");

  // 1. جلب بيانات المستخدم
  useEffect(() => {
    const getUser = async () => {
      try {
        const u = await account.get();
        setUser(u);
      } catch (e) {
        setUser(null);
      }
    };
    getUser();
  }, []);

  // 2. جلب تفاصيل الفيلم/المسلسل من TMDB
  useEffect(() => {
    const fetchData = async () => {
      setLoadingInfo(true);
      try {
        const lang = isAr ? 'ar-SA' : 'en-US';
        const baseUrl = `https://api.themoviedb.org/3/${type}/${id}`;

        // جلب التفاصيل، الطاقم، والمشابهة في وقت واحد
        const [resDetails, resCredits, resSimilar] = await Promise.all([
            fetch(`${baseUrl}?api_key=${API_KEY}&language=${lang}`),
            fetch(`${baseUrl}/credits?api_key=${API_KEY}&language=${lang}`),
            fetch(`${baseUrl}/similar?api_key=${API_KEY}&language=${lang}`)
        ]);

        const dataDetails = await resDetails.json();
        const dataCredits = await resCredits.json();
        const dataSimilar = await resSimilar.json();

        setDetails(dataDetails);
        setCast(dataCredits.cast?.slice(0, 10) || []); // نأخذ أول 10 ممثلين
        setSimilar(dataSimilar.results?.slice(0, 10) || []); // نأخذ أول 10 مشابهة

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingInfo(false);
      }
    };

    if (id && API_KEY) {
        fetchData();
    }
  }, [id, type, isAr, API_KEY]);


  // إضافة تعليق
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      user: user ? user.name : "Guest",
      text: newComment,
      date: isAr ? "الآن" : "Just now"
    };
    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12 px-4 md:px-12">
      
      {/* زر العودة */}
      <div className="max-w-7xl mx-auto mb-6">
        <Link 
            href={`/watch/${id}?type=${type}`} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FFD700] transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>{isAr ? 'العودة للتفاصيل' : 'Back to Details'}</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === العمود الرئيسي === */}
        <div className="lg:col-span-3 space-y-8">
            
            {/* 1. السيرفرات */}
            <div className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-800">
                <h3 className="text-gray-400 text-sm font-bold mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#FFD700]"><path d="M18.75 12.75h1.5a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v2.25a.75.75 0 0 0 .75.75Zm-8.25 2.25h1.5a.75.75 0 0 0 .75-.75v-2.25a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v2.25a.75.75 0 0 0 .75.75Zm-6 0h1.5a.75.75 0 0 0 .75-.75v-2.25a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v2.25a.75.75 0 0 0 .75.75Z" /><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94c-2.693.637-5.383 1.117-7.691 1.403a.75.75 0 0 1-.618 0c-2.308-.286-4.998-.766-7.691-1.403Z" clipRule="evenodd" /></svg>
                    {isAr ? 'اختر السيرفر:' : 'Select Server:'}
                </h3>
                <div className="flex flex-wrap gap-3">
                    {SERVERS.map((server) => (
                        <button
                            key={server.id}
                            onClick={() => setCurrentServer(server)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 border ${
                                currentServer.id === server.id
                                    ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                                    : 'bg-[#141414] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                            }`}
                        >
                            {server.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. المشغل */}
            <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 aspect-video">
                 <VideoPlayer src={currentServer.url} />
            </div>

            {/* --- 3. المنطقة الجديدة: تفاصيل العمل (قصة، طاقم، مشابهة) --- */}
            {!loadingInfo && details && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* أ. القصة ومعلومات العمل (يأخذ ثلثين المساحة) */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-800">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {details.title || details.name}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="bg-[#FFD700] text-black px-2 py-0.5 rounded font-bold text-xs">IMDb {details.vote_average.toFixed(1)}</span>
                                    <span>{(details.release_date || details.first_air_date)?.split('-')[0]}</span>
                                    <span className="text-gray-600">|</span>
                                    <span>{details.genres.map(g => g.name).join(', ')}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                            {details.overview || (isAr ? "لا يتوفر وصف لهذا العمل حالياً." : "No overview available.")}
                        </p>
                    </div>

                    {/* ب. طاقم التمثيل (Cast) */}
                    {cast.length > 0 && (
                        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-800">
                             <h3 className="text-lg font-bold text-[#FFD700] mb-4 flex items-center gap-2">
                                {isAr ? 'طاقم التمثيل' : 'Top Cast'}
                             </h3>
                             <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {cast.map((person) => (
                                    <div key={person.id} className="flex-shrink-0 w-24 text-center group">
                                        <div className="w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#FFD700] transition-all">
                                            <img 
                                                src={person.profile_path 
                                                    ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                                                    : '/placeholder-user.png'} 
                                                alt={person.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h4 className="text-xs font-bold text-white truncate">{person.name}</h4>
                                        <p className="text-[10px] text-gray-500 truncate">{person.character}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                {/* ج. أعمال مشابهة (Similar) - عمود جانبي */}
                <div className="md:col-span-1">
                    <div className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-800 h-full max-h-[500px] overflow-y-auto custom-scrollbar">
                        <h3 className="text-lg font-bold text-white mb-4 border-s-4 border-[#FFD700] ps-2">
                             {isAr ? 'أعمال مشابهة' : 'More Like This'}
                        </h3>
                        <div className="space-y-4">
                            {similar.map((item) => (
                                <Link 
                                    key={item.id} 
                                    href={`/player/${item.id}?type=${type}`} // إعادة تحميل الصفحة بمعرف جديد
                                    className="flex gap-3 hover:bg-white/5 p-2 rounded-lg transition group"
                                >
                                    <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-800">
                                        <img 
                                            src={item.poster_path 
                                                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                                                : '/placeholder.png'} 
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h4 className="text-sm font-bold text-white group-hover:text-[#FFD700] transition line-clamp-2">
                                            {item.title || item.name}
                                        </h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-[#FFD700] text-xs">★</span>
                                            <span className="text-xs text-gray-400">{item.vote_average.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
            )}

            {/* 4. التعليقات (أسفل كل شيء) */}
            <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-700 pb-4">
                    {isAr ? 'التعليقات' : 'Comments'} 
                    <span className="bg-[#FFD700] text-black text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
                </h3>

                {/* خانة إضافة تعليق */}
                {user ? (
                    <div className="flex gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center font-bold text-[#FFD700] border border-gray-600">
                             {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={isAr ? "أضف تعليقك هنا..." : "Add your comment here..."}
                                className="w-full bg-[#141414] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors resize-none h-24"
                            />
                            <div className="flex justify-end mt-2">
                                <button 
                                    onClick={handleAddComment}
                                    className="bg-[#FFD700] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#FFC000] transition text-sm"
                                >
                                    {isAr ? 'نشر التعليق' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#141414] p-4 rounded-lg text-center text-gray-400 mb-8 border border-dashed border-gray-700">
                        <Link href="/login" className="text-[#FFD700] hover:underline font-bold mx-1">{isAr ? 'سجل دخولك' : 'Login'}</Link> 
                        {isAr ? 'لإضافة تعليق' : 'to post a comment'}
                    </div>
                )}

                {/* قائمة التعليقات */}
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center font-bold text-gray-400 border border-gray-700">
                                {comment.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-white text-sm group-hover:text-[#FFD700] transition-colors">{comment.user}</h4>
                                    <span className="text-xs text-gray-500">• {comment.date}</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}