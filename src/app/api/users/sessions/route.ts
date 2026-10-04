import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";

/* GET — list all sessions for current user */
export async function GET(request: NextRequest) {
    const auth = await authVerify({ req: request, skipStreak: true });
    if (!auth.success || !auth.data) {
        return NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
    }

    const rows = await db.orm.public.Session
        .where({ userId: auth.data.userId })
        .all();

    return NextResponse.json({
        success: true,
        data: {
            currentSessionId: auth.data.sessionId,
            sessions: rows.map((s: any) => ({
                id: s.id,
                deviceName: s.deviceName,
                browser: s.browser,
                os: s.os,
                city: s.city,
                country: s.country,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
                current: s.id === auth.data.sessionId,
            })),
        },
    });
}

/* DELETE — revoke all sessions except the current one */
export async function DELETE(request: NextRequest) {
    const auth = await authVerify({ req: request, skipStreak: true });
    
    if (!auth.success || !auth.data) {
        return NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
    }

    // Get all sessions except current
    const rows = await db.orm.public.Session
        .where({ userId: auth.data.userId })
        .all();

    for (const s of rows) {
        if (s.id !== auth.data.sessionId) {
            await db.orm.public.Session.where({ id: s.id }).delete();
        }
    }

    return NextResponse.json({ success: true });
}