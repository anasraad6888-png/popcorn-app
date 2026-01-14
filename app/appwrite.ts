// app/appwrite.ts
import { Client, Account, Databases, Avatars, Query } from 'appwrite';

// 1. تهيئة العميل (Client)
const client = new Client();

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // رابط السيرفر الرسمي
    .setProject('6966bd5300096be1fcc3'); // ⚠️ استبدل هذا بالكود الذي نسخته

// 2. تصدير الخدمات التي سنستخدمها
export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);
export { Query } from 'appwrite';
// لتوليد معرفات عشوائية فريدة
export { ID } from 'appwrite';
export const DATABASE_ID = "6967c9d1001bcb3ce08e"; 
export const COLLECTION_ID_MYLIST = "mylist";