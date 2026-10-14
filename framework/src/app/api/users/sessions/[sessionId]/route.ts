import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    const auth = await authVerify({ req: request, skipStreak: true });
    if (!auth.success || !auth.data) {
        return NextResponse.json(
            { success: false, error: "Not logged in" },
            { status: 401 },
        );
    }

    const { sessionId } = await params;

    // Filter by `id`, not `sessionId`
    const session = await db.orm.public.Session.where({ id: sessionId }).first();

    // Ownership check — can't delete someone else's session
    if (!session || session.userId !== auth.data.userId) {
        return NextResponse.json(
            { success: false, error: "Session not found" },
            { status: 404 },
        );
    }

    // Block deleting the current session here (use logout for that)
    if (sessionId === auth.data.sessionId) {
        return NextResponse.json(
            { success: false, error: "Use the logout button for your current session" },
            { status: 400 },
        );
    }

    await db.orm.public.Session.where({ id: sessionId }).delete();

    return NextResponse.json({ success: true });
}