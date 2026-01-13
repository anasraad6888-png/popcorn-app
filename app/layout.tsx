import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // 1. استيراد الناف بار (لاحظ النقطتين للرجوع للخلف)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Movie App",
  description: "Best Movie App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      {/* 2. أضفنا bg-black لضمان الخلفية السوداء وتثبيت الناف بار */}
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Navbar /> 
        {children}
      </body>
    </html>
  );
}