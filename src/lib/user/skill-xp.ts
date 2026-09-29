import { Temporal } from "temporal-polyfill";
import { db } from "@/prisma/db";
import { getSkill } from "@/lib/skills/skills";
import { applyXp } from "@/lib/user/apply-xp";

export type SkillState = "unlocked" | "in_progress" | "mastered";

export function xpForState(xpGain: number, state: SkillState): number {
    if (state === "mastered") return xpGain;
    if (state === "in_progress") return Math.round((xpGain * 2) / 3);
    return Math.round(xpGain / 3);
}

export function stateFor(
    bestSet: number,
    repsTarget: [number, number, number],
): SkillState {
    if (bestSet >= repsTarget[2]) return "mastered";
    if (bestSet >= repsTarget[0]) return "in_progress";
    return "unlocked";
}

export interface SkillLogResult {
    skillSlug: string;
    previousBestSet: number;
    newBestSet: number;
    previousState: SkillState;
    newState: SkillState;
    xpDelta: number;
    newTotalXp: number;
    justMastered: boolean;
    levelUp: { from: number; to: number } | null;
    tierUp: { from: number; to: number } | null;
}

export async function logSkillReps(
    userId: string,
    skillSlug: string,
    reps: number,
): Promise<SkillLogResult | null> {
    const skill = getSkill(skillSlug);
    if (!skill) return null;
    if (reps < 0) return null;

    const target = skill.System.repsTarget;
    const xpGain = skill.System.xpGain;

    const existing = await db.orm.public.UserSkill
        .where({ userId, skillSlug })
        .first();

    const previousBestSet = existing?.bestSet ?? 0;
    const previousState = stateFor(previousBestSet, target);

    const newBestSet = Math.max(previousBestSet, reps);
    const newState = stateFor(newBestSet, target);

    const oldXp = xpForState(xpGain, previousState);
    const newXp = xpForState(xpGain, newState);
    const xpDelta = newXp - oldXp;

    const justMastered =
        previousState !== "mastered" && newState === "mastered";

    /* ── Write UserSkill ───────────────────────────────────── */
    if (existing) {
        // Prisma 8 fluent: .where().update()
        await db.orm.public.UserSkill
            .where({ userId, skillSlug })
            .update({
                bestSet: newBestSet,
                ...(justMastered
                    ? { masteredAt: Temporal.Now.instant() }
                    : {}),
            });
    } else {
        await db.orm.public.UserSkill.create({
            userId,
            skillSlug,
            bestSet: newBestSet,
            masteredAt: justMastered ? Temporal.Now.instant() : null,
        });
    }

    /* ── Apply XP ──────────────────────────────────────────── */
    let xpChange: {
        newTotalXp: number;
        delta: number;
        levelUp: { from: number; to: number } | null;
        tierUp: { from: number; to: number } | null;
    };

    if (xpDelta !== 0) {
        xpChange = await applyXp(userId, xpDelta, "skill");
    } else {
        const row = await db.orm.public.UserXP.where({ userId }).first();
        xpChange = {
            newTotalXp: row?.totalXp ?? 0,
            delta: 0,
            levelUp: null,
            tierUp: null,
        };
    }

    return {
        skillSlug,
        previousBestSet,
        newBestSet,
        previousState,
        newState,
        xpDelta,
        newTotalXp: xpChange.newTotalXp,
        justMastered,
        levelUp: xpChange.levelUp,
        tierUp: xpChange.tierUp,
    };
}