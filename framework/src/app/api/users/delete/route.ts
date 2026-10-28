import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";
export async function DELETE(req: NextRequest) {
    try {
        const user = await authVerify({ req: req, skipStreak: true });
        if (!user.success) {
            return NextResponse.json({ success: false, message: "You are not logged IN!" }, { status: 401 });
        }
        const userId = user.data?.userId;

        if (!userId) {
            return NextResponse.json({ success: false, message: "User identity missing!" }, { status: 400 });
        }
        await db.orm.public.User.where({ id: user.data?.userId }).delete();
        await db.orm.public.Session.where({ userId: user.data?.userId }).delete();
        return NextResponse.json({ success: true, message: "Account Delete Successfully!" }, { status: 200 });
    } catch (err) {
        const error = err instanceof Error ? err.message : "Unexpected server error!";
        console.log(error);
        return NextResponse.json({ success: false, message: error }, { status: 500 });
    }
}
