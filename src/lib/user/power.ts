import { db } from "@/prisma/db";
import { getSkill } from "@/lib/skills/skills";

/* =========================================================
   POWER LEVEL

   Power = base + skill power + streak power

   · Skill power: reflects WHAT you've mastered
   · Streak power: reflects how consistent you've been
   · Base: every user starts at 10

   Streak contribution uses LONGEST streak (not current),
   so power never decreases when a streak breaks.
   ========================================================= */

const BASE_POWER = 10;
const POWER_PER_STREAK_DAY = 25;

const MAX_POWER_BY_TIER: Record<number, number> = {
    0:  150,
    1:  500,
    2:  2_000,
    3:  8_000,
    4:  25_000,
    5:  80_000,
    6:  250_000,
    7:  800_000,
    8:  2_500_000,
    9:  8_000_000,
    10: 20_000_000,
};

const SKILLS_PER_TIER: Record<number, number> = {
    0: 4, 1: 5, 2: 7, 3: 10, 4: 10,
    5: 10, 6: 10, 7: 10, 8: 7, 9: 6, 10: 6,
};

const POWER_PER_SKILL_BY_TIER: Record<number, number> = (() => {
    const out: Record<number, number> = {};
    let prevMax = BASE_POWER;

    for (let t = 0; t <= 10; t++) {
        const range = MAX_POWER_BY_TIER[t] - prevMax;
        const count = SKILLS_PER_TIER[t] ?? 1;
        out[t] = Math.round(range / count);
        prevMax = MAX_POWER_BY_TIER[t];
    }

    return out;
})();

export type SkillState = "unlocked" | "in_progress" | "mastered";

export function skillPower(skillTier: number, state: SkillState): number {
    const gain = POWER_PER_SKILL_BY_TIER[skillTier] ?? 0;
    if (state === "mastered") return gain;
    if (state === "in_progress") return Math.round(gain / 3);
    return 0;
}

function stateFor(
    bestSet: number,
    repsTarget: [number, number, number],
): SkillState {
    if (bestSet >= repsTarget[2]) return "mastered";
    if (bestSet >= repsTarget[0]) return "in_progress";
    return "unlocked";
}

/* ── Compute total power for a user ──────────────────────── */
export async function computeUserPower(userId: string): Promise<number> {
    /* ── 1. Skill power ────────────────────────────────────── */
    const rows = (await db.orm.public.UserSkill
        .where({ userId })
        .all()) as Array<{
        skillSlug: string;
        bestSet: number;
    }>;

    let skillTotal = 0;

    for (const row of rows ?? []) {
        const skill = getSkill(row.skillSlug);
        if (!skill) continue;

        const state = stateFor(row.bestSet, skill.System.repsTarget);
        skillTotal += skillPower(skill.tier, state);
    }

    /* ── 2. Streak power ───────────────────────────────────── */
    const streakRow = await db.orm.public.UserStreak
        .where({ userId })
        .first();

    const streakDays = streakRow?.longestStreak ?? 0;
    const streakTotal = streakDays * POWER_PER_STREAK_DAY;

    /* ── 3. Total ──────────────────────────────────────────── */
    return BASE_POWER + skillTotal + streakTotal;
}
