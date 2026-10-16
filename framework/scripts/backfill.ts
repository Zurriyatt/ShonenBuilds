
import "dotenv/config";
import { db } from "../src/prisma/db";
import { Temporal } from "temporal-polyfill";
import { DEFAULT_SETTINGS } from "../src/lib/user/defaultSettings";

function thisMonday(): string {
    const today = Temporal.Now.plainDateISO("UTC");
    return today.subtract({ days: today.dayOfWeek - 1 }).toString();
}

async function backfill() {
    const users = await db.orm.public.User.where({}).all();
    console.log(`Processing ${users.length} users...`);

    let created = { settings: 0, xp: 0, streak: 0, weekly: 0 };
    let updatedSettings = 0;

    for (const user of users) {
        /* ── Settings ──
           Two cases:
             1. No row at all          → create with DEFAULT_SETTINGS
             2. Row exists but empty   → overwrite with DEFAULT_SETTINGS
        */
        const s = await db.orm.public.UserSettings.where({ userId: user.id }).first();

        if (!s) {
            await db.orm.public.UserSettings.create({
                userId: user.id,
                settings: DEFAULT_SETTINGS,
            });
            created.settings++;
        } else {
            // Check if it's empty {} — if so, upgrade to DEFAULT_SETTINGS
            const isEmpty =
                !s.settings ||
                typeof s.settings !== "object" ||
                Object.keys(s.settings as object).length === 0;

            if (isEmpty) {
                await db.orm.public.UserSettings
                    .where({ userId: user.id })
                    .update({ settings: DEFAULT_SETTINGS });
                updatedSettings++;
            }
        }

        /* ── XP ── */
        const xp = await db.orm.public.UserXP.where({ userId: user.id }).first();
        if (!xp) {
            await db.orm.public.UserXP.create({ userId: user.id });
            created.xp++;
        }

        /* ── Streak ── */
        const st = await db.orm.public.UserStreak.where({ userId: user.id }).first();
        if (!st) {
            await db.orm.public.UserStreak.create({ userId: user.id });
            created.streak++;
        }

        /* ── WeeklyProgress ── */
        const wk = await db.orm.public.WeeklyProgress.where({ userId: user.id }).first();
        if (!wk) {
            await db.orm.public.WeeklyProgress.create({
                userId: user.id,
                weeklyDate: thisMonday(),
                weekXp: 0,
                power: 10,
            });
            created.weekly++;
        }
    }

    console.log("Created:", created);
    console.log("Updated settings (was empty):", updatedSettings);
}

backfill()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Backfill failed:", err);
        process.exit(1);
    });
