
import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";
import { resolveSettings } from "@/lib/user/defaultSettings";

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
        const { endpoint, keys, userAgent } = body as {
            endpoint?: string;
            keys?: { p256dh?: string; auth?: string };
            userAgent?: string;
        };

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json(
                { success: false, error: "endpoint and keys required" },
                { status: 400 },
            );
        }

        const userId = auth.data.userId;

        /* ── 3. Guard: same endpoint can't exist twice ── */
        const existing = await db.orm.public.PushSubscription
            .where({ endpoint })
            .first();

            if (existing) {
                return NextResponse.json(
                    { success: false, error: "Subscription already exists" },
                    { status: 409 },
                );
            }

        /* ── 4. Create the subscription row ── */
        await db.orm.public.PushSubscription.create({
            userId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            userAgent: userAgent ?? null,
        });

        /* ── 5. Turn on the streak-reminder preference ── */
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
                        streakReminder: true,
                        dailyTraining: true,
                    },
                },
            });

        /* ── 6. Respond ── */
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("[push/subscribe] error:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 },
        );
    }
}
