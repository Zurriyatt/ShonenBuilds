import { db } from "@/prisma/db";
import { getLevelFromXp, getTierFromLevel } from "@/lib/world/MPS";

/* =========================================================
   APPLY XP

   The single write path for UserXP.totalXp.
   Every XP source (skill, streak, future bonuses) calls this.

   Prisma 8 fluent: .where({...}).update({...}) — never
   .update({ where, data }).
   ========================================================= */

export interface XpChange {
    newTotalXp: number;
    delta: number;
    levelUp: { from: number; to: number } | null;
    tierUp: { from: number; to: number } | null;
}

export async function applyXp(
    userId: string,
    delta: number,
    source: "skill" | "streak",
): Promise<XpChange> {
    const existing = await db.orm.public.UserXP.where({ userId }).first();

    const oldTotalXp = existing?.totalXp ?? 0;
    const newTotalXp = Math.max(0, oldTotalXp + delta);

    const oldLevel = getLevelFromXp(oldTotalXp);
    const newLevel = getLevelFromXp(newTotalXp);

    const oldTier = getTierFromLevel(oldLevel);
    const newTier = getTierFromLevel(newLevel);

    /* ── Write ─────────────────────────────────────────────── */
    if (existing) {
        // Prisma 8 fluent — .where().update()
        await db.orm.public.UserXP
            .where({ userId })
            .update(
                source === "skill"
                    ? {
                          totalXp: newTotalXp,
                          skillXp: existing.skillXp + delta,
                      }
                    : {
                          totalXp: newTotalXp,
                          streakXp: existing.streakXp + delta,
                      },
            );
    } else {
        await db.orm.public.UserXP.create({
            userId,
            totalXp: newTotalXp,
            skillXp: source === "skill" ? delta : 0,
            streakXp: source === "streak" ? delta : 0,
        });
    }

    return {
        newTotalXp,
        delta,
        levelUp: newLevel > oldLevel ? { from: oldLevel, to: newLevel } : null,
        tierUp: newTier > oldTier ? { from: oldTier, to: newTier } : null,
    };
}