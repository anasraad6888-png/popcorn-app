import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['ar', 'en'];

export default getRequestConfig(async ({requestLocale}) => {
  // استقبال اللغة كـ Promise
  let locale = await requestLocale;

  // التحقق من أن اللغة مدعومة، وإذا لا نستخدم الافتراضي 'ar'
  if (!locale || !locales.includes(locale as any)) {
    locale = 'ar'; 
  }

  return {
    locale, // 👈 أضفنا هذا السطر لحل مشكلة الـ TypeScript
    messages: (await import(`./messages/${locale}.json`)).default
  };
});