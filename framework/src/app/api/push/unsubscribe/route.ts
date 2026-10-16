
import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";
import { resolveSettings } from "@/lib/user/defaultSettings";
/* =========================================================
   POST /api/push/unsubscribe

   Body: { endpoint }

   Deletes this device's subscription row.
   If it was the user's last subscription, flips the
   streakReminder preference off.
   ========================================================= */

export async function POST(request: NextRequest) {
    try {
        /* ── 1. Auth ── */
        const auth = await authVerify({ req: request, skipStreak: true });
        if (!auth.success || !auth.data) {
            return NextResponse.json(
                { success: false, error: "Not logged in" },
                { status: 401 },
            );
        }

        /* ── 2. Parse + validate body ── */
        const body = await request.json();
        const { endpoint } = body as { endpoint?: string };

        if (!endpoint) {
            return NextResponse.json(
                { success: false, error: "endpoint required" },
                { status: 400 },
            );
        }

        const userId = auth.data.userId;

        /* ── 3. Ownership check ──
           Only delete if this endpoint belongs to the current user.
        */
        const sub = await db.orm.public.PushSubscription
            .where({ endpoint })
            .first();

        if (!sub || sub.userId !== userId) {
            // Idempotent — nothing to do, treat as success
            return NextResponse.json({ success: true }, { status: 200 });
        }

        /* ── 4. Delete the subscription ── */
        await db.orm.public.PushSubscription
            .where({ endpoint })
            .delete();

        /* ── 5. If it was the last one, flip the preference off ── */
        const remaining = await db.orm.public.PushSubscription
            .where({ userId })
            .all();

        if (remaining.length === 0) {
            const settingsRow = await db.orm.public.UserSettings
                .where({ userId })
                .first();

            const current = resolveSettings(settingsRow?.settings);

            await db.orm.public.UserSettings
                .where({ userId })
                .update({
                    settings: {
                        ...current,
                        notifications: {
                            ...current.notifications,
                            streakReminder: false,
                            dailyTraining: false,
                        },
                    },
                });
        }

        /* ── 6. Respond ── */
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("[push/unsubscribe] error:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 },
        );
    }
}
