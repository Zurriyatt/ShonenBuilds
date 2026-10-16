import { IncomingMessage, ServerResponse } from "http";
import webpush from "web-push";
import { Temporal } from "temporal-polyfill";
import { db } from "../../prisma/db.js";
import { resolveSettings } from "../DEFAULT_SETINGS.js";
/* =========================================================
   Configure web-push once at module load.
   These three values prove our identity to FCM/APNs.
   ========================================================= */
webpush.setVapidDetails(
    process.env.NEXT_PUBLIC_VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!,
);

/* Today in the given timezone as "YYYY-MM-DD" */
function todayIn(timezone: string): string {
    try {
        return Temporal.Now.plainDateISO(timezone).toString();
    } catch {
        return Temporal.Now.plainDateISO("UTC").toString();
    }
}

/* =========================================================
   POST /streak-reminder

   Fires from cron at ~8 PM local. For each user:
     · has an active streak (currentStreak > 0)
     · has NOT checked in today
     · has streakReminder enabled in settings
     · has at least one push subscription

   Sends push. Cleans up dead subscriptions (410/404).
   ========================================================= */
export async function streakReminder(req: IncomingMessage, res: ServerResponse) {
    try {
        const today = todayIn("UTC"); // v1: assume UTC. TODO: per-user timezone.

        // 1. All streaks with an active current streak
        const streaks = await db.orm.public.UserStreak.where({}).all();
        console.log(streaks);
        const atRisk = streaks.filter((s: any) => {
            if (!s.currentStreak || s.currentStreak <= 0) return false;
            if (!s.lastCheckInDate) return false;
            // At risk = hasn't checked in today (their last check-in is older)
            return s.lastCheckInDate < today;
        });

        console.log(`[streak-reminder] ${atRisk.length} users at risk`);

        // 2. For each at-risk user — check prefs, get subs, push
        const results = await Promise.allSettled(
            atRisk.map(async (streak: any) => {
                const userId = streak.userId;

                // a. Check preference
                const settingsRow = await db.orm.public.UserSettings
                    .where({ userId })
                    .first();
                    
                const settings = resolveSettings(settingsRow?.settings);
                console.log(settingsRow,'rows')
                if (!settings.notifications.streakReminder) {
                    return { userId, sent: 0, reason: "pref-off" };
                }

                // b. Get all subscriptions for this user (may be multiple devices)
                const subs = await db.orm.public.PushSubscription
                    .where({ userId })
                    .all();
                console.log(subs);
                if (subs.length === 0) {
                    return { userId, sent: 0, reason: "no-subs" };
                }

                // c. Push to each device
                let sent = 0;
                for (const sub of subs) {
                    try {
                        await webpush.sendNotification(
                            {
                                endpoint: sub.endpoint,
                                keys: { p256dh: sub.p256dh, auth: sub.auth },
                            },
                            JSON.stringify({
                                title: "🔥 Streak about to break",
                                body: `Your ${streak.currentStreak}-day streak expires tonight. One rep keeps it alive.`,
                                url: "/realm",
                                tag: "streak-reminder",
                            }),
                        );
                        sent++;
                    } catch (err: any) {
                        // Dead subscription — delete it
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            await db.orm.public.PushSubscription
                                .where({ endpoint: sub.endpoint })
                                .delete();
                            console.log(`[streak-reminder] cleaned dead sub for ${userId}`);
                        } else {
                            console.error(
                                `[streak-reminder] push failed for ${userId}:`,
                                err.message,
                            );
                        }
                    }
                }

                return { userId, sent, reason: "ok" };
            }),
        );

        // 3. Summary
        const succeeded = results.filter(
            (r) => r.status === "fulfilled" && (r.value as any).sent > 0,
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        console.log(
            `[streak-reminder] ${succeeded} users notified, ${failed} failed, ${atRisk.length} total`,
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
            JSON.stringify({
                processed: atRisk.length,
                succeeded,
                failed,
            }),
        );
    } catch (err) {
        console.error("[streak-reminder] fatal:", err);
        if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    error: err instanceof Error ? err.message : "Server error",
                }),
            );
        }
    }
}
