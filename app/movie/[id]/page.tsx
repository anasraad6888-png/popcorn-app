"use client";
import { account, databases, ID, Query, DATABASE_ID, COLLECTION_ID_MYLIST } from '@/app/appwrite';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import YouTube from 'react-youtube';
import Link from 'next/link';
import movieTrailer from 'movie-trailer';

// --- تعريف الواجهات (Types) ---
interface Cast {
  id: number;
  name: string;
  profile_path: string;
  character: string;
}

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  still_path: string;
  overview: string;
  vote_average: number;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string;
}

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genres: { id: number; name: string }[];
  seasons?: Season[]; // للمسلسلات
}

const WatchPage = () => {
  const { id } = useParams();
  
  // States للبيانات الأساسية
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>("");
  const [type, setType] = useState<'movie' | 'tv'>('movie');

  // States للمسلسلات
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  // States للتفاعل (Like/Dislike/Favorite)
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [favDocId, setFavDocId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // 1. جلب البيانات الأساسية عند فتح الصفحة
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // محاولة جلب كفيلم أولاً
        let data;
        let mediaType: 'movie' | 'tv' = 'movie';
        
        const movieReq = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=ar-SA`);
        const movieData = await movieReq.json();

        if (movieReq.ok && movieData.title) {
           data = movieData;
           mediaType = 'movie';
        } else {
           // إذا فشل، نجرب كمسلسل
           const tvReq = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=ar-SA`);
           const tvData = await tvReq.json();
           data = tvData;
           mediaType = 'tv';
        }

        setMovie(data);
        setType(mediaType);
        fetchAdditionalData(id, mediaType);

        // جلب التريلر
        const searchName = data.title || data.name || "";
        movieTrailer(searchName, { id: true, multi: false } as any)
          .then((res: any) => setTrailerUrl(res))
          .catch(() => console.log("Trailer not found"));

      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [id, API_KEY]);

  // 2. دالة جلب الممثلين والمشابه
  const fetchAdditionalData = async (contentId: any, mediaType: string) => {
      const creditsReq = await fetch(`https://api.themoviedb.org/3/${mediaType}/${contentId}/credits?api_key=${API_KEY}&language=ar-SA`);
      const creditsData = await creditsReq.json();
      if (creditsData.cast) setCast(creditsData.cast.slice(0, 10));

      const similarReq = await fetch(`https://api.themoviedb.org/3/${mediaType}/${contentId}/similar?api_key=${API_KEY}&language=ar-SA`);
      const similarData = await similarReq.json();
      if (similarData.results) setSimilarMovies(similarData.results);
  };

  // 3. جلب الحلقات عند تغيير الموسم (خاص بالمسلسلات)
useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // جلب المستخدم الحالي
        const user = await account.get();
        setCurrentUser(user);

        // البحث في قاعدة البيانات: هل يوجد سجل لهذا المستخدم وهذا الفيلم؟
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID_MYLIST,
          [
            Query.equal('userId', user.$id),
            Query.equal('tmdbId', id as string) // id يأتي من الرابط
          ]
        );

        if (response.documents.length > 0) {
          setFavDocId(response.documents[0].$id); // الفيلم موجود، احفظ الـ ID
        }
      } catch (error) {
        console.log("User not logged in or error checking favs");
      }
    };

    checkFavoriteStatus();
  }, [id]);

  // 2. دالة التبديل (إضافة / حذف)
  const toggleFavorite = async () => {
    if (!currentUser) {
      alert("يجب تسجيل الدخول لإضافة المفضلات!");
      return;
    }

    try {
      if (favDocId) {
        // --- حالة الحذف: إذا كان مفضلاً بالفعل ---
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID_MYLIST,
          favDocId
        );
        setFavDocId(null); // تحديث الواجهة
        // alert("تم الحذف من القائمة");
      } else {
        // --- حالة الإضافة: إذا لم يكن مفضلاً ---
        if (!movie) return;

        const doc = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID_MYLIST,
          ID.unique(),
          {
            userId: currentUser.$id,
            tmdbId: String(movie.id),
            title: movie.title || movie.name,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date || movie.first_air_date,
            media_type: type // 'movie' or 'tv'
          }
        );
        setFavDocId(doc.$id); // تحديث الواجهة
        // alert("تمت الإضافة للقائمة");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("حدث خطأ أثناء التحديث");
    }
  };


  // التفاعل مع الأزرار
  const toggleLike = () => { setLiked(!liked); if (disliked) setDisliked(false); };
  const toggleDislike = () => { setDisliked(!disliked); if (liked) setLiked(false); };


  if (!movie) return <div className="min-h-screen bg-[#141414] flex items-center justify-center text-[#FFD700]">جاري التحميل...</div>;

  const displayTitle = movie.title || movie.name;
  const displayDate = movie.release_date || movie.first_air_date;

  return (
    <div className="min-h-screen bg-[#141414] text-white pb-20">
      
      {/* ========================================== */}
      {/* 1. القسم العلوي (Backdrop + Floating Trailer) */}
      {/* ========================================== */}
      <div className="relative w-full h-[85vh]">
        
        {/* صورة الخلفية */}
        <div className="absolute inset-0">
            <img 
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`} 
                alt={displayTitle} 
                className="w-full h-full object-cover"
            />
            {/* تدرجات لونية لجعل النص واضحاً */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
        </div>

        {/* التريلر العائم (على اليسار) */}
        {trailerUrl && (
            <div className="hidden lg:block absolute bottom-20 left-10 w-[450px] aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/80 border-2 border-[#FFD700]/20 hover:scale-105 transition-transform duration-300 z-30 group">
                 {/* طبقة لحماية الفيديو من النقر الخطأ، تختفي عند التفاعل */}
                 <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-transparent"></div>
                 <YouTube 
                    videoId={trailerUrl} 
                    opts={{ 
                        width: '100%', 
                        height: '100%', 
                        playerVars: { autoplay: 0, controls: 1, modestbranding: 1 } 
                    }} 
                    className="w-full h-full"
                 />
                 <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Trailer
                 </div>
            </div>
        )}

        {/* محتوى النصوص والأزرار (على اليمين) */}
        <div className="absolute bottom-0 right-0 w-full md:w-[60%] p-6 md:p-12 z-20 flex flex-col items-start text-right">
            
            <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-2xl text-white leading-tight">
                {displayTitle}
            </h1>

            <div className="flex items-center gap-4 text-sm md:text-base text-gray-300 mb-6 font-medium">
                <span className="bg-[#FFD700] text-black px-2 py-0.5 rounded font-bold">IMDb {movie.vote_average.toFixed(1)}</span>
                <span>{displayDate?.split("-")[0]}</span>
                {movie.seasons && <span>{movie.seasons.length} مواسم</span>}
                <span className="text-gray-400">|</span>
                <span>{movie.genres?.map(g => g.name).join(" • ")}</span>
            </div>

            <p className="text-gray-200 text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl leading-relaxed drop-shadow-md">
                {movie.overview}
            </p>

            {/* الأزرار الرئيسية */}
            <div className="flex items-center gap-4">
                
                {/* زر المشاهدة (يظهر فقط للأفلام) */}
                {type === 'movie' && (
                    <button className="flex items-center gap-3 bg-[#FFD700] hover:bg-[#FFC000] text-black px-8 py-3.5 rounded-lg font-bold text-lg transition shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-105">
                        <PlayIconSolid />
                        مشاهدة الفيلم
                    </button>
                )}

                {/* زر الإضافة للمفضلة (مشترك) */}
                <button 
                    onClick={toggleFavorite}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-lg font-bold text-lg transition border-2 
                    ${favDocId
                        ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                        : 'bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md'}`}
                >
                    {favDocId ? <CheckIcon /> : <PlusIcon />}
                    {favDocId ? 'تمت الإضافة' : 'قائمتي'}
                </button>

            </div>

             {/* أزرار التفاعل (لايك / ديسلايك) - التصميم الجديد */}
             <div className="flex gap-4 mt-8">
                <button onClick={toggleLike} className="group relative">
                    <div className={`p-3 rounded-full transition-all duration-300 ${liked ? 'bg-white text-black scale-110' : 'bg-black/50 text-white hover:bg-[#333]'}`}>
                         {liked ? <LikeIconSolid /> : <LikeIconOutline />}
                    </div>
                </button>

                <button onClick={toggleDislike} className="group relative">
                     <div className={`p-3 rounded-full transition-all duration-300 ${disliked ? 'bg-white text-black scale-110' : 'bg-black/50 text-white hover:bg-[#333]'}`}>
                         {disliked ? <DislikeIconSolid /> : <DislikeIconOutline />}
                    </div>
                </button>
            </div>

        </div>
      </div>

      <div className="px-4 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* العمود الرئيسي (يمين) */}
        <div className="lg:col-span-8">
            
            {/* ========================================== */}
            {/* 2. قسم المسلسلات (اختيار المواسم والحلقات) */}
            {/* ========================================== */}
            {type === 'tv' && movie.seasons && (
                <div className="mb-12 bg-[#1f1f1f] p-6 rounded-xl border border-gray-800">
                    <h3 className="text-2xl font-bold mb-6 text-[#FFD700] flex items-center gap-2">
                        <PlayIconOutline /> اختر الحلقة
                    </h3>
                    
                    {/* شريط المواسم */}
                    <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-thin scrollbar-thumb-[#FFD700] scrollbar-track-gray-800">
                        {movie.seasons.filter(s => s.season_number > 0).map((season) => (
                            <button
                                key={season.id}
                                onClick={() => setSelectedSeason(season.season_number)}
                                className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all ${
                                    selectedSeason === season.season_number 
                                    ? 'bg-[#FFD700] text-black' 
                                    : 'bg-black/40 text-gray-400 hover:text-white border border-gray-700'
                                }`}
                            >
                                {season.name}
                            </button>
                        ))}
                    </div>

                    {/* قائمة الحلقات */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {episodes.map((ep) => (
                            <div key={ep.id} className="flex gap-4 p-3 rounded-lg hover:bg-[#333] transition cursor-pointer group bg-black/20 border border-transparent hover:border-gray-600">
                                <div className="relative min-w-[140px] h-[80px]">
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w300${ep.still_path || movie.backdrop_path}`} 
                                        alt={ep.name} 
                                        className="w-full h-full object-cover rounded"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <PlayIconSolid className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="font-bold text-gray-200 text-sm group-hover:text-[#FFD700] transition line-clamp-1">
                                        {ep.episode_number}. {ep.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ep.overview || "لا يتوفر وصف للحلقة."}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* قسم القصة */}
            <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 text-[#FFD700] border-r-4 border-[#FFD700] pr-3">قصة العمل</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{movie.overview || "لا يوجد وصف متاح لهذا العمل."}</p>
            </div>

            {/* طاقم التمثيل */}
            <div>
                <h3 className="text-xl font-bold mb-6 text-[#FFD700] border-r-4 border-[#FFD700] pr-3">طاقم التمثيل</h3>
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                    {cast.map((actor) => (
                        <div key={actor.id} className="min-w-[110px] flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-gray-800 group-hover:border-[#FFD700] transition">
                                {actor.profile_path ? (
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                                        alt={actor.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-3xl">👤</div>
                                )}
                            </div>
                            <p className="text-sm font-bold text-white group-hover:text-[#FFD700] transition">{actor.name}</p>
                            <p className="text-xs text-gray-500">{actor.character}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* العمود الجانبي (أعمال مشابهة) */}
        <div className="lg:col-span-4">
             <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 sticky top-24">
                <h3 className="text-lg font-bold mb-5 text-white flex justify-between items-center">
                    أعمال مشابهة
                    <span className="text-xs bg-[#FFD700] text-black px-2 py-1 rounded font-bold">Recommended</span>
                </h3>
                <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                    {similarMovies.slice(0, 8).map((sim) => (
                        sim.poster_path && (
                            <Link href={`/watch/${sim.id}`} key={sim.id}>
                                <div className="flex gap-3 hover:bg-[#252525] p-2 rounded-lg transition cursor-pointer group border border-transparent hover:border-gray-700">
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w92${sim.poster_path}`} 
                                        alt={sim.title} 
                                        className="w-16 h-24 object-cover rounded bg-gray-800"
                                    />
                                    <div className="flex flex-col justify-center">
                                        <h4 className="font-bold text-sm text-gray-200 group-hover:text-[#FFD700] transition line-clamp-1">{sim.title || sim.name}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded border border-gray-600">
                                                {(sim.release_date || sim.first_air_date || "").split("-")[0]}
                                            </span>
                                            <span className="text-xs text-[#FFD700] font-bold">⭐ {sim.vote_average.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default WatchPage;

// --- الأيقونات (HeroIcons v2) ---

// 1. Play Icons
const PlayIconSolid = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);
const PlayIconOutline = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.971l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653Z" />
    </svg>
);

// 2. Plus/Check Icons
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

// 3. Like Icons (Outline vs Solid)
const LikeIconOutline = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a2.25 2.25 0 0 1 2.25 2.25V7.5h2.25c.621 0 1.125.504 1.125 1.125V9.81c0 .46-.268.883-.67 1.057l-5.603 2.378c-.282.12-.591.137-.886.046a1.125 1.125 0 0 1-.823-1.07V10.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5a2.25 2.25 0 0 0-2.25 2.25v6A2.25 2.25 0 0 0 6 21h12.75a2.25 2.25 0 0 0 2.25-2.25V11.25a2.25 2.25 0 0 0-2.25-2.25H6Z" />
    </svg>
);
const LikeIconSolid = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a2.25 2.25 0 0 1 2.25 2.25V7.5h2.25c.621 0 1.125.504 1.125 1.125V9.81c0 .46-.268.883-.67 1.057l-5.603 2.378c-.282.12-.591.137-.886.046a1.125 1.125 0 0 1-.823-1.07V10.5Z" />
        <path d="M6 10.5a2.25 2.25 0 0 0-2.25 2.25v6A2.25 2.25 0 0 0 6 21h12.75a2.25 2.25 0 0 0 2.25-2.25V11.25a2.25 2.25 0 0 0-2.25-2.25H6Z" />
    </svg>
);

// 4. Dislike Icons (Outline vs Solid)
const DislikeIconOutline = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25l-5.688 3.555a1.125 1.125 0 0 1-1.688-.977V4.5h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 4.5V3a2.25 2.25 0 0 0-2.25-2.25h-5.25a2.25 2.25 0 0 0-2.25 2.25v1.5m9.75 0H7.5" />
    </svg>
);
const DislikeIconSolid = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a.443.443 0 0 1-.633-.633l6.478-3.566a.75.75 0 0 0-.361-1.425l-1.674.295a3 3 0 0 1 3.786-1.417ZM6 10.5a2.25 2.25 0 0 0-2.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25h12.75a2.25 2.25 0 0 0 2.25-2.25v-5.029c0-.663-.158-1.309-.452-1.897l-3.375-6.074A2.25 2.25 0 0 0 15.029 2.25H9.75a2.25 2.25 0 0 0-2.25 2.25v1.5a2.25 2.25 0 0 0 .524 1.408l-1.95 1.082A2.25 2.25 0 0 0 6 10.5Z" />
    </svg>
);