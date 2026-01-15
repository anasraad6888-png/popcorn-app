import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next'; // استيراد النوع

const withNextIntl = createNextIntlPlugin('./i18n.ts');
const nextConfig: NextConfig = { // تحديد النوع هنا
    images: {
        domains: ['image.tmdb.org', 'upload.wikimedia.org', 'cloud.appwrite.io']
    }
};

export default withNextIntl(nextConfig);