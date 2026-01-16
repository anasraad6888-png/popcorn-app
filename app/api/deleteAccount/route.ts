import { Client, Users } from 'node-appwrite';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. استقبال معرف المستخدم من الطلب
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 2. إعداد عميل Appwrite بصلاحيات الأدمن
        const client = new Client()
            .setEndpoint('https://nyc.cloud.appwrite.io/v1') // أو الرابط الخاص بك
            .setProject('6966bd5300096be1fcc3')      // ⚠️ ضع Project ID الخاص بك هنا
            .setKey(process.env.APPWRITE_API_KEY!);    // قراءة المفتاح السري

        const users = new Users(client);

        // 3. حذف المستخدم نهائياً من قاعدة البيانات
        await users.delete(userId);

        return NextResponse.json({ success: true, message: 'User deleted permanently' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}