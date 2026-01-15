import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Hero from "@/components/Hero";
import Row from "@/components/Row";
import requests from "@/utils/requests";
import { useTranslations } from 'next-intl';
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PopCorn",
  description: "Movie App",
};

export default function Home() {
  const t = useTranslations('Rows');
  return (
    <main>
      <Hero />
      
<div className="relative z-20 flex flex-col gap-8 -mt-[0px] md:-mt-0 pb-20 px-6 md:px-8 bg-[#141414]">
        <Row title={t('trending')} fetchUrl={requests.fetchTrending} />
        <Row title={t('top_rated')} fetchUrl={requests.fetchTopRated} />
        <Row title={t('action')} fetchUrl={requests.fetchActionMovies} />
        <Row title={t('comedy')} fetchUrl={requests.fetchComedyMovies} />
        <Row title={t('horror')} fetchUrl={requests.fetchHorrorMovies} />
        <Row title={t('romance')} fetchUrl={requests.fetchRomanceMovies} />
        <Row title={t('documentaries')} fetchUrl={requests.fetchDocumentaries} />
      </div>
    </main>
  );
}