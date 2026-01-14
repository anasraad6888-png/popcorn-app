import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Hero from "@/components/Hero";
import Row from "@/components/Row";
import requests from "@/utils/requests";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Movie App",
  description: "Best Movie App",
};

export default function Home() {
  return (
    <main>
      {/* استدعاء واجهة الفيلم */}
      <Hero />
      
      {/* مساحة تجريبية بالأسفل لنرى التمرير */}
<div className="flex flex-col gap-8 mt-4 md:mt-10 pb-20 px-4 md:px-8 bg-[#141414]">
        <Row title="الأكثر مشاهدة هذا الأسبوع 🔥" fetchUrl={requests.fetchTrending} />
        <Row title="الأعلى تقييماً ⭐" fetchUrl={requests.fetchTopRated} />
        <Row title="أفلام الأكشن ⚔️" fetchUrl={requests.fetchActionMovies} />
        <Row title="أفلام الكوميديا 😂" fetchUrl={requests.fetchComedyMovies} />
        <Row title="أفلام الرعب 👻" fetchUrl={requests.fetchHorrorMovies} />
        <Row title="رومانسية ❤️" fetchUrl={requests.fetchRomanceMovies} />
        <Row title="وثائقيات 🎥" fetchUrl={requests.fetchDocumentaries} />
      </div>
    </main>
  );
}