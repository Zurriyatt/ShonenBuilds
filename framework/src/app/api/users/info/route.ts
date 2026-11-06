import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
export async function POST(request: NextRequest) {
    try {
        // 1. Auth Check
        const auth = await authVerify({ req: request, skipStreak: true });
        if (!auth.success || !auth.data) {
            return NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
        }

        const userId = auth.data.userId;

        // 2. Parse FormData
        const formData = await request.formData();
        const avatarFile = formData.get("avatar") as File | null;

        if (!avatarFile || avatarFile.size === 0) {
            return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
        }

        // 3. File to Buffer
        const arrayBuffer = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "shonenbuilds_avatars" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        const avatarUrl = (uploadResult as any).secure_url;

        // 5. Update DB
        await db.orm.public.User
            .where({ id: userId })
            .update({ avatar: avatarUrl });

        // 6. Return Success
        return NextResponse.json({ 
            success: true, 
            message: "Avatar updated successfully",
            avatarUrl 
        }, { status: 200 });

    } catch (err) {
        console.error("[user/info] Error:", err);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}