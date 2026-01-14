import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "PopCorn",
  description: "By Anas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      {/* 1. أضفنا flex لجعل العناصر بجانب بعضها */}
      <body className={`${cairo.className} flex bg-[#141414] min-h-screen`}>
        
        {/* القائمة الجانبية (ستكون على اليمين تلقائياً بسبب RTL) */}
        <Sidebar />
        
        {/* 2. المحتوى الرئيسي: يأخذ باقي المساحة المتاحة (flex-1) */}
        <main className="flex-1 w-full relative">
          <Navbar />
            {children}
        </main>
        
      </body>
    </html>
  );
}