import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // قائمة اللغات
  locales: ['ar', 'en'],
 
  // اللغة الافتراضية
  defaultLocale: 'ar'
});
 
export const config = {
  // هذا الماتشر (Matcher) يضمن تطبيق الميدل وير على كل الصفحات
  // ما عدا ملفات الـ API، ملفات Next.js الداخلية، والملفات ذات الامتدادات (صور، خطوط، الخ)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};