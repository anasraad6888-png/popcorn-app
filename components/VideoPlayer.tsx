"use client";

import React, { useRef, useState, useEffect } from "react";

interface VideoPlayerProps {
  src: string;       // رابط الفيديو (MP4)
  poster?: string;   // صورة البوستر قبل التشغيل
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // مؤقت لإخفاء التحكم
  let controlsTimeout: NodeJS.Timeout;

  // 1. التعامل مع التشغيل والإيقاف
  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  // 2. تحديث شريط التقدم والوقت
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
      if (total) setDuration(total);
    }
  };

  // 3. القفز في الفيديو (Scrubbing)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  // 4. التحكم في الصوت
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuteStatus = !isMuted;
      setIsMuted(newMuteStatus);
      videoRef.current.muted = newMuteStatus;
      if (!newMuteStatus && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  // 5. ملء الشاشة
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 6. تنسيق الوقت (دقيقة:ثانية)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 7. إظهار/إخفاء التحكم عند حركة الماوس
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div
      ref={playerRef}
      className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl border border-gray-800"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* عنصر الفيديو الأساسي */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />

      {/* طبقة زر التشغيل الكبير في المنتصف (تظهر عند الإيقاف) */}
      {!playing && (
        <div 
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10"
        >
          <div className="w-20 h-20 rounded-full bg-[#FFD700]/90 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,215,0,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-black ml-1">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* شريط التحكم السفلي */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-4 transition-opacity duration-300 z-20 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* شريط التقدم (Timeline) */}
        <div className="relative w-full h-1.5 bg-gray-600 rounded-full cursor-pointer mb-4 group/timeline">
          <div 
             className="absolute top-0 left-0 h-full bg-[#FFD700] rounded-full z-10" 
             style={{ width: `${progress}%` }} 
          />
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="absolute top-[-6px] left-0 w-full h-4 opacity-0 cursor-pointer z-20"
          />
        </div>

        {/* الأزرار السفلية */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            {/* زر تشغيل/إيقاف صغير */}
            <button onClick={togglePlay} className="hover:text-[#FFD700] transition">
              {playing ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* الوقت */}
            <div className="text-xs font-medium font-mono text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            {/* التحكم بالصوت */}
            <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="hover:text-[#FFD700]">
                    {isMuted || volume === 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM20.25 13.5v-3c0-1.353-.34-2.614-.935-3.71l1.58-1.58A9.015 9.015 0 0 1 21.75 10.5v3c0 .872-.144 1.708-.408 2.486l-1.581-1.581a7.489 7.489 0 0 0 .489-1.905ZM16.5 10.5v1.655l1.623 1.622a4.515 4.515 0 0 0 .127-3.277ZM12.75 5.567v3.318l1.782 1.782A.75.75 0 0 0 15 10.5v-3c0-1.586-.88-2.962-2.176-3.712a.75.75 0 0 0-.67.067l-4.5 2.812-1.205 1.205 6.301-2.305Z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" /><path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" /></svg>
                    )}
                </button>
                <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={isMuted ? 0 : volume} 
                    onChange={handleVolumeChange}
                    className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300 h-1 accent-[#FFD700] bg-gray-600 rounded-lg cursor-pointer"
                />
            </div>
          </div>

          {/* زر التكبير */}
          <button onClick={toggleFullscreen} className="hover:text-[#FFD700] transition">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.25h-3a.75.75 0 0 1-.75-.75ZM6 3.75a.75.75 0 0 1 7.5-.75h3a.75.75 0 0 1-.75.75v3a.75.75 0 0 1-1.5 0V5.25h-3a.75.75 0 0 1-.75-.75ZM3.75 15a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75ZM19.5 15a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h3v-3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;