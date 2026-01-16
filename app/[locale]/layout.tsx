import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css'; 

const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "PopCorn",
  description: "Movies & Series App",
};

// تعريف نوع الـ Props الجديد (params هو Promise)
interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // 👈 التغيير المهم هنا
}

export default async function RootLayout({
  children,
  params
}: RootLayoutProps) {
  
  // 1. فك الوعد (Await) للحصول على اللغة
  const { locale } = await params;

  // 2. جلب الرسائل
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={cairo.className}>
        <NextIntlClientProvider messages={messages}>
           <Navbar />
           <div className="flex w-full overflow-x-hidden">
             <Sidebar />
             <main className="flex-1 pb-16 md:pb-0 w-0 min-w-0">
               {children}
             </main>
           </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}