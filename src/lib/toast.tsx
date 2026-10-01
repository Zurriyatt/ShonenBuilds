"use client";

import toast from "react-hot-toast";
import {
    XpToast,
    MasteryToast,
    LevelUpToast,
    TierUpToast,
    StreakToast,
    MilestoneToast,
} from "@/components/Toast";

/* =========================================================
   TOAST API

   All fire functions live here. Components in the app
   import only these — never toast.custom() directly.

   Each function owns its duration + variant.
   ========================================================= */

/* ── Durations per variant ────────────────────────────────
   Bigger event → stays longer. */
const DURATION = {
    xp: 2400,
    streak: 2400,
    mastery: 4000,
    levelUp: 4000,
    tierUp: 5000,
    milestone: 5000,
} as const;

/* ── Base toast options — strip default styling ────────── */
const baseOptions = {
    style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        borderRadius: 0,
        maxWidth: "none",
    
    },
} as const;

/* ═════════════════════════════════════════════════════════
   FIRING FUNCTIONS
   ═════════════════════════════════════════════════════════ */

export function showXpToast(props: {
    xp: number;
    skillName: string;
    state: "unlocked" | "in_progress" | "mastered";
}) {
    toast.custom(
        () => <XpToast {...props} />,
        { duration: DURATION.xp, ...baseOptions },
    );
}

export function showMasteryToast(props: {
    skillName: string;
    xp: number;
    icon?: string;
}) {
    toast.custom(
        () => <MasteryToast {...props} />,
        { duration: DURATION.mastery, ...baseOptions },
    );
}

export function showLevelUpToast(props: {
    from: number;
    to: number;
    xpForNext: number;
}) {
    toast.custom(
        () => <LevelUpToast {...props} />,
        { duration: DURATION.levelUp, ...baseOptions },
    );
}

export function showTierUpToast(props: {
    worldColor: string;
    worldGlow: string;
    worldBorder: string;
    worldIcon: string;
    worldName: string;
    newRank: string;
    tier: number;
}) {
    toast.custom(
        () => <TierUpToast {...props} />,
        { duration: DURATION.tierUp, ...baseOptions },
    );
}

export function showStreakToast(props: { days: number; xp: number }) {
    toast.custom(
        () => <StreakToast {...props} />,
        { duration: DURATION.streak, ...baseOptions },
    );
}

export function showMilestoneToast(props: {
    days: number;
    bonus: number;
    dailyXp: number;
}) {
    toast.custom(
        () => <MilestoneToast {...props} />,
        { duration: DURATION.milestone, ...baseOptions },
    );
}
