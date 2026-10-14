// workers/src/lib/weekly-progress.ts

import { IncomingMessage, ServerResponse } from "http";
import { Resend } from "resend";
import { db } from "../../prisma/db.js";

/* ─────────────────────────────────────────────────────────
   1. Resend client — one instance, reused.

   No OAuth, no token refresh, no SMTP pool.
   Just an API key in env and a fetch call under the hood.
   ───────────────────────────────────────────────────────── */
const resend = new Resend(process.env.RESEND_API_KEY);

/* ─────────────────────────────────────────────────────────
   2. sendEmail — takes a specific user's data.
   Throws on failure so Promise.allSettled records "rejected".
   ───────────────────────────────────────────────────────── */
async function sendEmail(to: string, row: any) {
    const { data, error } = await resend.emails.send({
        // onboarding@resend.dev works in dev without a custom domain.
        // Replace with your domain later (e.g. "ShonenBuilds <hello@shonenbuilds.online>")
        from: "onboarding@resend.dev",
        to,
        subject: "Your week on ShonenBuilds",
        html: `
            <h1>Week in review</h1>
            <p>XP gained last week: <strong>${row.lastWeekXp}</strong></p>
            <p>Power: ${row.lastPower} → ${row.power}</p>
        `,
    });

    if (error) throw new Error(error.message);
    return data;
}

/* ─────────────────────────────────────────────────────────
   3. The handler — runs when /weekly-progress is hit.
   ───────────────────────────────────────────────────────── */
export async function weeklyProgress(req: IncomingMessage, res: ServerResponse) {
    try {
        /* ── Step 1: fetch all weekly progress rows ── */
        const allRows = await db.orm.public.WeeklyProgress.where({}).all();

        /* ── Step 2: filter ──
           Send only when:
             - a week has rolled over (lastWeekDate exists)
             - user actually did something (lastWeekXp > 0)
             - we haven't already emailed about this week
        */
        const toEmail = allRows.filter(
            (r: any) =>
                r.lastWeekDate !== null &&
                r.lastWeekXp > 0 &&
                r.lastEmailedWeek !== r.weeklyDate,
        );

        console.log(`[weeklyProgress] ${toEmail.length} emails to send`);

        /* ── Step 3: send + mark as emailed ──
           Promise.allSettled so one failure doesn't kill the batch.
           Update happens INSIDE the same async block — only runs
           if sendEmail succeeded (no throw).
        */
        const sends = await Promise.allSettled(
            toEmail.map(async (row: any) => {
                const user = await db.orm.public.User
                    .where({ id: row.userId })
                    .first();

                if (!user) throw new Error(`User ${row.userId} not found`);

                await sendEmail(user.email, row);

                await db.orm.public.WeeklyProgress
                    .where({ userId: row.userId })
                    .update({ lastEmailedWeek: row.weeklyDate });

                return { userId: row.userId, email: user.email };
            }),
        );

        /* ── Step 4: summarize ── */
        const succeeded = sends.filter((r) => r.status === "fulfilled").length;
        const failed = sends.filter((r) => r.status === "rejected").length;

        /* Log failures so you can see what broke */
        sends.forEach((r, i) => {
            if (r.status === "rejected") {
                console.error(`[weeklyProgress] send #${i} failed:`, r.reason);
            }
        });

        console.log(`[weeklyProgress] ${succeeded} sent, ${failed} failed`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
            JSON.stringify({
                attempted: toEmail.length,
                succeeded,
                failed,
            }),
        );
    } catch (err) {
        console.error("[weeklyProgress] fatal:", err);
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