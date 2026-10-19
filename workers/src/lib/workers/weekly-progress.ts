// workers/src/lib/weekly-progress.ts

import { IncomingMessage, ServerResponse } from "http";
import { Resend } from "resend";
import { db } from "../../prisma/db.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = "https://shonenbuilds.online";

/* ─────────────────────────────────────────────────────────
   Email HTML template.

   Email-client rules:
   · Tables for layout — Outlook doesn't do flexbox
   · Inline styles only — Gmail strips <style> in some contexts
   · No CSS variables — hardcode the hex values
   · Width capped at 600px — the standard email width
   · Preheader — hidden text Gmail shows in the inbox preview
   ───────────────────────────────────────────────────────── */
function buildEmailHtml(username: string, row: any): string {
    const xpGained = row.lastWeekXp ?? 0;
    const startPower = row.lastPower ?? 0;
    const endPower = row.power ?? 0;
    const powerDelta = endPower - startPower;
    const deltaSign = powerDelta >= 0 ? "+" : "";

    // Colors hardcoded from your theme (emails can't read CSS vars)
    const BG         = "#09080f";
    const CARD       = "#0f0e1a";
    const CARD_INNER = "#16151f";
    const BORDER     = "#22203a";
    const TEXT       = "#eeeef2";
    const MUTED      = "#6b6880";
    const GOLD       = "#f5a41e";
    const VIOLET     = "#8a5cf5";
    const CYAN       = "#03e4ff";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Week on ShonenBuilds</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'DM Sans',Helvetica,Arial,sans-serif;color:${TEXT};">

<!-- Preheader: shows next to subject in inbox preview -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    You gained ${xpGained.toLocaleString()} XP last week. Keep the streak alive.
</div>

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:40px 16px;">
    <tr>
        <td align="center">

            <!-- Card -->
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${CARD};border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">

                <!-- ═══ Header ═══ -->
                <tr>
                    <td style="padding:28px 32px 24px;border-bottom:1px solid ${BORDER};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${VIOLET};">
                                    ⚡ ShonenBuilds
                                </td>
                                <td align="right" style="font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${MUTED};">
                                    Weekly Report
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- ═══ Greeting ═══ -->
                <tr>
                    <td style="padding:32px 32px 8px;">
                        <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:${TEXT};line-height:1.3;">
                            Hey @${username},
                        </p>
                        <p style="margin:8px 0 0;font-size:14px;color:${MUTED};line-height:1.5;">
                            Another week forged. Here's how it went.
                        </p>
                    </td>
                </tr>

                <!-- ═══ XP Gained ═══ -->
                <tr>
                    <td style="padding:24px 32px 0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CARD_INNER};border:1px solid ${BORDER};border-radius:12px;">
                            <tr>
                                <td style="padding:24px 24px 20px;text-align:center;">
                                    <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${MUTED};">
                                        XP Gained
                                    </p>
                                    <p style="margin:0;font-size:44px;font-weight:700;letter-spacing:-0.03em;color:${GOLD};line-height:1;text-shadow:0 0 24px ${GOLD};">
                                        +${xpGained.toLocaleString()}
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- ═══ Power Delta ═══ -->
                <tr>
                    <td style="padding:16px 32px 0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CARD_INNER};border:1px solid ${BORDER};border-radius:12px;">
                            <tr>
                                <td style="padding:20px 24px;text-align:center;">
                                    <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${MUTED};">
                                        Power Level
                                    </p>
                                    <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:${TEXT};">
                                        <span style="color:${MUTED};">${startPower.toLocaleString()}</span>
                                        <span style="color:${MUTED};padding:0 8px;">→</span>
                                        <span style="color:${CYAN};">${endPower.toLocaleString()}</span>
                                    </p>
                                    <p style="margin:8px 0 0;font-size:12px;font-weight:700;color:${powerDelta >= 0 ? CYAN : "#ef2e2e"};letter-spacing:0.04em;">
                                        ${deltaSign}${powerDelta.toLocaleString()} this week
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- ═══ CTA ═══ -->
                <tr>
                    <td style="padding:28px 32px 8px;text-align:center;">
                        <a href="${SITE_URL}/realm" style="display:inline-block;background:${VIOLET};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;letter-spacing:-0.01em;">
                            Continue Your Ascent →
                        </a>
                    </td>
                </tr>

                <!-- ═══ Footer ═══ -->
                <tr>
                    <td style="padding:28px 32px 32px;text-align:center;border-top:1px solid ${BORDER};">
                        <p style="margin:0 0 6px;font-size:12px;color:${MUTED};line-height:1.5;">
                            You're receiving this because you train on ShonenBuilds.
                        </p>
                        <p style="margin:0;font-size:11px;color:${MUTED};opacity:0.7;">
                            <a href="${SITE_URL}/dojo" style="color:${MUTED};text-decoration:underline;">Manage preferences</a>
                            &nbsp;·&nbsp;
                            © 2026 ShonenBuilds
                        </p>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────
   sendEmail — builds HTML from user + row, sends via Resend.
   ───────────────────────────────────────────────────────── */
async function sendEmail(user: { email: string; username: string }, row: any) {
    const xpGained = row.lastWeekXp ?? 0;

    const { data, error } = await resend.emails.send({
        from: "ShonenBuilds <hello@shonenbuilds.online>",
        to: user.email,
        subject: `You gained ${xpGained.toLocaleString()} XP last week ⚡`,
        html: buildEmailHtml(user.username, row),
    });

    if (error) throw new Error(error.message);
    return data;
}

/* ─────────────────────────────────────────────────────────
   Handler — unchanged from before.
   ───────────────────────────────────────────────────────── */
export async function weeklyProgress(req: IncomingMessage, res: ServerResponse) {
    try {
        const allRows = await db.orm.public.WeeklyProgress.where({}).all();

        const toEmail = allRows.filter(
            (r: any) =>
                r.lastWeekDate !== null &&
                r.lastWeekXp > 0 &&
                r.lastEmailedWeek !== r.weeklyDate,
        );

        console.log(`[weeklyProgress] ${toEmail.length} emails to send`);

        const sends = await Promise.allSettled(
            toEmail.map(async (row: any) => {
                const user = await db.orm.public.User
                    .where({ id: row.userId })
                    .first();

                if (!user) throw new Error(`User ${row.userId} not found`);

                await sendEmail(user, row);

                await db.orm.public.WeeklyProgress
                    .where({ userId: row.userId })
                    .update({ lastEmailedWeek: row.weeklyDate });

                return { userId: row.userId, email: user.email };
            }),
        );

        const succeeded = sends.filter((r) => r.status === "fulfilled").length;
        const failed = sends.filter((r) => r.status === "rejected").length;

        sends.forEach((r, i) => {
            if (r.status === "rejected") {
                console.error(`[weeklyProgress] send #${i} failed:`, r.reason);
            };
        });

        console.log(`[weeklyProgress] ${succeeded} sent, ${failed} failed`);
        console.log("Task finished successfully! Shutting down immediatel       y to save hours.");
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
        };
    };
};