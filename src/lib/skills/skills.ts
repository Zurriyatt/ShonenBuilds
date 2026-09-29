import { POWER_TIERS } from "../world/MPS";

/* =========================================================
   TYPES
   ========================================================= */
export type SkillCategory = "push" | "pull" | "legs" | "core";
export type SkillUnit = "reps" | "sec";

/* Per-skill runtime system:
     unit         → "reps" or "sec" — how the target is counted
     repsTarget   → [unlock, inProgress, mastery] thresholds
     xpGain       → total XP awarded at mastery (tier-derived) */
export interface SkillSystem {
    unit: SkillUnit;
    repsTarget: [number, number, number];
    xpGain: number;
}

export interface Skill {
    slug: string;
    name: string;
    category: SkillCategory;
    tier: number;
    icon?: string;
    System: SkillSystem;
    parentSlug: string | null;
    description: string;
    x: number;
    y: number;
}

/* =========================================================
   XP PER TIER

   Sum of all mastered skills in a tier ≥ XP needed to
   reach the next tier (per the level curve in MPS.ts).

   tier 0 →  25 XP, 4 skills  → 7  each (28 total)
   tier 1 → 205 XP, 5 skills  → 41 each
   tier 2 → 870 XP, 7 skills  → 125 each
   tier 3 → 5,200 XP, 10 skills → 520 each
   tier 4 → 19,500, 10 skills → 1,950 each
   tier 5 → 39,900, 10 skills → 3,990 each
   tier 6 → 54,600, 10 skills → 5,460 each
   tier 7 → 59,400, 10 skills → 5,940 each
   tier 8 → 71,500, 7 skills → 10,215 each
   tier 9 → 67,500, 6 skills → 11,250 each
   tier 10 → 32,600, 6 skills → 5,433 each
   ========================================================= */
const XP_GAIN_BY_TIER: Record<number, number> = {
    0: 217,
    1: 391,
    2: 1_175,
    3: 1_770,
    4: 3_200,
    5: 5_040,
    6: 5_800,
    7: 6_000,     
    8: 6_250,    
    9: 8_000,     
    10: 7_200,
};


function gain(tier: number): number {
    return XP_GAIN_BY_TIER[tier] ?? 0;
}

/* =========================================================
   SKILLS — 85 total

   SLUGS MUST BE UNIQUE. Duplicate slugs cause infinite
   recursion in layoutCategory().
   ========================================================= */
export const SKILLS: Skill[] = [
    /* ═══════════════════════════════════════════════════════
       PUSH — 26
       ═══════════════════════════════════════════════════════ */
    {
        slug: "incline-push-up",
        name: "Incline Push-Up",
        category: "push",
        tier: 0,
        icon: "/SKILL_ICONS/inclinePushups.svg",
        System: { unit: "reps", repsTarget: [8, 15, 25], xpGain: gain(0) },
        parentSlug: null,
        description: "Hands elevated on a bench or box.",
        x: 2000, y: 2000,
    },
    {
        slug: "knee-push-up",
        name: "Knee Push-Up",
        category: "push",
        tier: 1,
        System: { unit: "reps", repsTarget: [5, 15, 30], xpGain: gain(1) },
        parentSlug: "incline-push-up",
        description: "Knees down. Full range.",
        x: 2100, y: 2000,
    },
    {
        slug: "standard-push-up",
        name: "Standard Push-Up",
        category: "push",
        tier: 2,
        icon: "/SKILL_ICONS/pushup.svg",
        System: { unit: "reps", repsTarget: [10, 20, 35], xpGain: gain(2) },
        parentSlug: "knee-push-up",
        description: "Full push-up. Fork point.",
        x: 2200, y: 2000,
    },

    /* ── Push · Vertical ── */
    {
        slug: "pike-push-up",
        name: "Pike Push-Up",
        category: "push",
        tier: 3,
        System: { unit: "reps", repsTarget: [8, 12, 20], xpGain: gain(3) },
        parentSlug: "standard-push-up",
        description: "Pike position. Shoulder focus.",
        x: 2300, y: 1900,
    },
    {
        slug: "elevated-pike-push-up",
        name: "Elevated Pike Push-Up",
        category: "push",
        tier: 4,
        System: { unit: "reps", repsTarget: [6, 10, 15], xpGain: gain(4) },
        parentSlug: "pike-push-up",
        description: "Feet elevated. Deeper angle.",
        x: 2400, y: 1850,
    },
    {
        slug: "chest-to-wall-handstand-hold",
        name: "Chest-to-Wall Handstand Hold",
        category: "push",
        tier: 5,
        System: { unit: "sec", repsTarget: [20, 45, 90], xpGain: gain(5) },
        parentSlug: "elevated-pike-push-up",
        description: "Chest to wall. Vertical foundation.",
        x: 2500, y: 1800,
    },
    {
        slug: "wall-hspu-negatives",
        name: "Wall HSPU Negatives",
        category: "push",
        tier: 6,
        System: { unit: "reps", repsTarget: [3, 6, 10], xpGain: gain(6) },
        parentSlug: "chest-to-wall-handstand-hold",
        description: "Lower slow. Controlled eccentric.",
        x: 2600, y: 1750,
    },
    {
        slug: "wall-handstand-push-up",
        name: "Wall Handstand Push-Up",
        category: "push",
        tier: 7,
        System: { unit: "reps", repsTarget: [3, 6, 10], xpGain: gain(7) },
        parentSlug: "wall-hspu-negatives",
        description: "Chest to wall. Full press.",
        x: 2700, y: 1700,
    },
    {
        slug: "freestanding-handstand-hold",
        name: "Freestanding Handstand Hold",
        category: "push",
        tier: 8,
        System: { unit: "sec", repsTarget: [10, 25, 60], xpGain: gain(8) },
        parentSlug: "wall-handstand-push-up",
        description: "No wall. Balance + strength.",
        x: 2800, y: 1650,
    },
    {
        slug: "freestanding-hspu",
        name: "Freestanding HSPU",
        category: "push",
        tier: 9,
        System: { unit: "reps", repsTarget: [1, 3, 6], xpGain: gain(9) },
        parentSlug: "freestanding-handstand-hold",
        description: "Freestanding handstand push-up.",
        x: 2900, y: 1600,
    },
    {
        slug: "deficit-freestanding-hspu",
        name: "Deficit Freestanding HSPU",
        category: "push",
        tier: 10,
        System: { unit: "reps", repsTarget: [1, 2, 4], xpGain: gain(10) },
        parentSlug: "freestanding-hspu",
        description: "Hands on blocks. Full ROM.",
        x: 3000, y: 1550,
    },
    {
        slug: "one-arm-handstand-push-up",
        name: "One-Arm Handstand Push-Up",
        category: "push",
        tier: 10,
        System: { unit: "reps", repsTarget: [1, 2, 3], xpGain: gain(10) },
        parentSlug: "deficit-freestanding-hspu",
        description: "The ultimate vertical push. S-RANK.",
        x: 3100, y: 1500,
    },

    /* ── Push · Planche ── */
    {
        slug: "planche-lean",
        name: "Planche Lean",
        category: "push",
        tier: 3,
        System: { unit: "sec", repsTarget: [10, 20, 40], xpGain: gain(3) },
        parentSlug: "standard-push-up",
        description: "Hands by hips. Lean forward.",
        x: 2300, y: 2000,
    },
    {
        slug: "pseudo-planche-push-up",
        name: "Pseudo Planche Push-Up",
        category: "push",
        tier: 4,
        System: { unit: "reps", repsTarget: [6, 12, 18], xpGain: gain(4) },
        parentSlug: "planche-lean",
        description: "Push from planche lean.",
        x: 2400, y: 2000,
    },
    {
        slug: "tuck-planche-hold",
        name: "Tuck Planche Hold",
        category: "push",
        tier: 5,
        System: { unit: "sec", repsTarget: [5, 10, 20], xpGain: gain(5) },
        parentSlug: "pseudo-planche-push-up",
        description: "Knees tucked. Straight arms.",
        x: 2500, y: 2000,
    },
    {
        slug: "adv-tuck-planche-hold",
        name: "Adv. Tuck Planche Hold",
        category: "push",
        tier: 6,
        System: { unit: "sec", repsTarget: [5, 10, 20], xpGain: gain(6) },
        parentSlug: "tuck-planche-hold",
        description: "Back flat, hips open.",
        x: 2600, y: 2000,
    },
    {
        slug: "straddle-planche-hold",
        name: "Straddle Planche Hold",
        category: "push",
        tier: 7,
        System: { unit: "sec", repsTarget: [3, 5, 10], xpGain: gain(7) },
        parentSlug: "adv-tuck-planche-hold",
        description: "Legs straddled wide.",
        x: 2700, y: 2000,
    },
    {
        slug: "full-planche-hold",
        name: "Full Planche Hold",
        category: "push",
        tier: 8,
        System: { unit: "sec", repsTarget: [2, 5, 10], xpGain: gain(8) },
        parentSlug: "straddle-planche-hold",
        description: "Legs together, body straight.",
        x: 2800, y: 2000,
    },
    {
        slug: "planche-push-up",
        name: "Planche Push-Up",
        category: "push",
        tier: 9,
        System: { unit: "reps", repsTarget: [1, 3, 6], xpGain: gain(9) },
        parentSlug: "full-planche-hold",
        description: "Push-up from full planche.",
        x: 2900, y: 2000,
    },

    /* ── Push · Dips & Unilateral ── */
    {
        slug: "diamond-push-up",
        name: "Diamond Push-Up",
        category: "push",
        tier: 3,
        icon: "/SKILL_ICONS/pushup.svg",
        System: { unit: "reps", repsTarget: [6, 12, 20], xpGain: gain(3) },
        parentSlug: "standard-push-up",
        description: "Hands under chest. Triceps.",
        x: 2300, y: 2100,
    },
    {
        slug: "parallel-bar-dips",
        name: "Parallel Bar Dips",
        category: "push",
        tier: 4,
        System: { unit: "reps", repsTarget: [5, 10, 20], xpGain: gain(4) },
        parentSlug: "diamond-push-up",
        description: "Full depth. Elbows back.",
        x: 2400, y: 2100,
    },
    {
        slug: "straight-bar-dips",
        name: "Straight-Bar Dips",
        category: "push",
        tier: 5,
        System: { unit: "reps", repsTarget: [4, 8, 15], xpGain: gain(5) },
        parentSlug: "parallel-bar-dips",
        description: "Bar behind you. Harder angle.",
        x: 2500, y: 2100,
    },
    {
        slug: "archer-push-up",
        name: "Archer Push-Up",
        category: "push",
        tier: 6,
        System: { unit: "reps", repsTarget: [5, 10, 15], xpGain: gain(6) },
        parentSlug: "straight-bar-dips",
        description: "One arm straight, one bent.",
        x: 2600, y: 2100,
    },
    {
        slug: "incline-one-arm-push-up",
        name: "Incline One-Arm Push-Up",
        category: "push",
        tier: 7,
        System: { unit: "reps", repsTarget: [4, 8, 12], xpGain: gain(7) },
        parentSlug: "archer-push-up",
        description: "Hand elevated. Unilateral load.",
        x: 2700, y: 2100,
    },
    {
        slug: "straddle-one-arm-push-up",
        name: "Straddle One-Arm Push-Up",
        category: "push",
        tier: 8,
        System: { unit: "reps", repsTarget: [2, 4, 8], xpGain: gain(8) },
        parentSlug: "incline-one-arm-push-up",
        description: "Legs wide. Balance assist.",
        x: 2800, y: 2100,
    },
    {
        slug: "full-one-arm-push-up",
        name: "Full One-Arm Push-Up",
        category: "push",
        tier: 9,
        System: { unit: "reps", repsTarget: [1, 3, 5], xpGain: gain(9) },
        parentSlug: "straddle-one-arm-push-up",
        description: "Full one-arm push-up.",
        x: 2900, y: 2100,
    },

    /* ═══════════════════════════════════════════════════════
       PULL — 26
       ═══════════════════════════════════════════════════════ */
    {
        slug: "dead-hang",
        name: "Dead Hang",
        category: "pull",
        tier: 0,
        icon: "/SKILL_ICONS/deadhang.svg",
        System: { unit: "sec", repsTarget: [15, 30, 60], xpGain: gain(0) },
        parentSlug: null,
        description: "Hang from bar. Passive.",
        x: 2000, y: 2000,
    },
    {
        slug: "active-hang",
        name: "Active Hang",
        category: "pull",
        tier: 1,
        System: { unit: "sec", repsTarget: [15, 30, 60], xpGain: gain(1) },
        parentSlug: "dead-hang",
        description: "Squeeze lats, pull down.",
        x: 1900, y: 2000,
    },
    {
        slug: "scapular-pull-ups",
        name: "Scapular Pull-Ups",
        category: "pull",
        tier: 2,
        System: { unit: "reps", repsTarget: [8, 12, 20], xpGain: gain(2) },
        parentSlug: "active-hang",
        description: "Shoulders engage from hang. Fork.",
        x: 1800, y: 2000,
    },

    /* ── Pull · Bent-arm (Vertical) ── */
    {
        slug: "negative-pull-up",
        name: "Negative Pull-Up",
        category: "pull",
        tier: 3,
        System: { unit: "reps", repsTarget: [3, 5, 8], xpGain: gain(3) },
        parentSlug: "scapular-pull-ups",
        description: "Jump up, lower slow.",
        x: 1700, y: 1900,
    },
    {
        slug: "standard-pull-up",
        name: "Standard Pull-Up",
        category: "pull",
        tier: 4,
        icon: "/SKILL_ICONS/pullup.svg",
        System: { unit: "reps", repsTarget: [3, 8, 15], xpGain: gain(4) },
        parentSlug: "negative-pull-up",
        description: "Overhand grip. Benchmark.",
        x: 1600, y: 1900,
    },
    {
        slug: "l-sit-pull-up",
        name: "L-Sit Pull-Up",
        category: "pull",
        tier: 5,
        System: { unit: "reps", repsTarget: [2, 5, 10], xpGain: gain(5) },
        parentSlug: "standard-pull-up",
        description: "Legs out. Core + pull.",
        x: 1500, y: 1800,
    },
    {
        slug: "weighted-pull-up",
        name: "Weighted Pull-Up",
        category: "pull",
        tier: 6,
        System: { unit: "reps", repsTarget: [2, 5, 10], xpGain: gain(6) },
        parentSlug: "l-sit-pull-up",
        description: "Belt or vest weight.",
        x: 1400, y: 1750,
    },
    {
        slug: "archer-pull-up",
        name: "Archer Pull-Up",
        category: "pull",
        tier: 7,
        System: { unit: "reps", repsTarget: [2, 4, 6], xpGain: gain(7) },
        parentSlug: "weighted-pull-up",
        description: "One arm assists, other pulls.",
        x: 1300, y: 1700,
    },
    {
        slug: "assisted-one-arm-pull-up",
        name: "Assisted One-Arm Pull-Up",
        category: "pull",
        tier: 8,
        System: { unit: "reps", repsTarget: [1, 2, 4], xpGain: gain(8) },
        parentSlug: "archer-pull-up",
        description: "One arm, other holds wrist.",
        x: 1200, y: 1650,
    },
    {
        slug: "one-arm-pull-up-negative",
        name: "One-Arm Pull-Up Negative",
        category: "pull",
        tier: 9,
        System: { unit: "reps", repsTarget: [1, 2, 4], xpGain: gain(9) },
        parentSlug: "assisted-one-arm-pull-up",
        description: "Lower slow on one arm.",
        x: 1100, y: 1600,
    },
    {
        slug: "full-one-arm-pull-up",
        name: "Full One-Arm Pull-Up",
        category: "pull",
        tier: 10,
        System: { unit: "reps", repsTarget: [1, 2, 3], xpGain: gain(10) },
        parentSlug: "one-arm-pull-up-negative",
        description: "One arm. Full pull. S-RANK.",
        x: 1000, y: 1550,
    },

    /* ── Pull · Bent-arm (Explosive) ── */
    {
        slug: "chest-to-bar-pull-up",
        name: "Chest-to-Bar Pull-Up",
        category: "pull",
        tier: 5,
        System: { unit: "reps", repsTarget: [3, 6, 12], xpGain: gain(5) },
        parentSlug: "standard-pull-up",
        description: "Pull higher. Chest touches bar.",
        x: 1500, y: 2000,
    },
    {
        slug: "explosive-high-pull-up",
        name: "Explosive High Pull-Up",
        category: "pull",
        tier: 6,
        System: { unit: "reps", repsTarget: [1, 3, 6], xpGain: gain(6) },
        parentSlug: "chest-to-bar-pull-up",
        description: "Pull to ribs / hips.",
        x: 1400, y: 2050,
    },
    {
        slug: "bar-muscle-up",
        name: "Bar Muscle-Up",
        category: "pull",
        tier: 7,
        System: { unit: "reps", repsTarget: [1, 3, 6], xpGain: gain(7) },
        parentSlug: "explosive-high-pull-up",
        description: "Pull-up into dip over the bar.",
        x: 1300, y: 2100,
    },
    {
        slug: "strict-bar-muscle-up",
        name: "Strict Bar Muscle-Up",
        category: "pull",
        tier: 8,
        System: { unit: "reps", repsTarget: [1, 2, 5], xpGain: gain(8) },
        parentSlug: "bar-muscle-up",
        description: "No kip. Strict form.",
        x: 1200, y: 2150,
    },
    {
        slug: "ring-muscle-up",
        name: "Ring Muscle-Up",
        category: "pull",
        tier: 9,
        System: { unit: "reps", repsTarget: [1, 2, 5], xpGain: gain(9) },
        parentSlug: "strict-bar-muscle-up",
        description: "False grip on rings.",
        x: 1100, y: 2200,
    },
    {
        slug: "iron-cross",
        name: "Iron Cross",
        category: "pull",
        tier: 10,
        System: { unit: "sec", repsTarget: [1, 2, 3], xpGain: gain(10) },
        parentSlug: "ring-muscle-up",
        description: "Arms straight out on rings. S-RANK.",
        x: 1000, y: 2250,
    },

    /* ── Pull · Straight-arm (Front Lever) ── */
    {
        slug: "australian-row",
        name: "Australian Row",
        category: "pull",
        tier: 3,
        System: { unit: "reps", repsTarget: [8, 15, 25], xpGain: gain(3) },
        parentSlug: "scapular-pull-ups",
        description: "Body at 45° under bar.",
        x: 1700, y: 2100,
    },
    {
        slug: "elevated-australian-row",
        name: "Elevated Australian Row",
        category: "pull",
        tier: 4,
        System: { unit: "reps", repsTarget: [6, 12, 20], xpGain: gain(4) },
        parentSlug: "australian-row",
        description: "Feet elevated. Straighter body.",
        x: 1600, y: 2150,
    },
    {
        slug: "tuck-front-lever-hold",
        name: "Tuck Front Lever Hold",
        category: "pull",
        tier: 5,
        System: { unit: "sec", repsTarget: [5, 10, 20], xpGain: gain(5) },
        parentSlug: "elevated-australian-row",
        description: "Knees tucked, body horizontal.",
        x: 1500, y: 2200,
    },
    {
        slug: "adv-tuck-front-lever-hold",
        name: "Adv. Tuck Front Lever Hold",
        category: "pull",
        tier: 6,
        System: { unit: "sec", repsTarget: [5, 10, 20], xpGain: gain(6) },
        parentSlug: "tuck-front-lever-hold",
        description: "Back flat, hips open.",
        x: 1400, y: 2250,
    },
    {
        slug: "half-lay-front-lever-hold",
        name: "Half-Lay Front Lever Hold",
        category: "pull",
        tier: 7,
        System: { unit: "sec", repsTarget: [3, 6, 12], xpGain: gain(7) },
        parentSlug: "adv-tuck-front-lever-hold",
        description: "One leg extended.",
        x: 1300, y: 2300,
    },
    {
        slug: "straddle-front-lever-hold",
        name: "Straddle Front Lever Hold",
        category: "pull",
        tier: 8,
        System: { unit: "sec", repsTarget: [3, 5, 8], xpGain: gain(8) },
        parentSlug: "half-lay-front-lever-hold",
        description: "Straddle, body flat.",
        x: 1200, y: 2350,
    },
    {
        slug: "full-front-lever-hold",
        name: "Full Front Lever Hold",
        category: "pull",
        tier: 9,
        System: { unit: "sec", repsTarget: [2, 5, 8], xpGain: gain(9) },
        parentSlug: "straddle-front-lever-hold",
        description: "Legs together, body straight.",
        x: 1100, y: 2400,
    },
    {
        slug: "front-lever-rows",
        name: "Front Lever Rows",
        category: "pull",
        tier: 10,
        System: { unit: "reps", repsTarget: [1, 3, 5], xpGain: gain(10) },
        parentSlug: "full-front-lever-hold",
        description: "Dynamic pull from full front lever.",
        x: 1000, y: 2450,
    },
    {
        slug: "one-arm-front-lever",
        name: "One-Arm Front Lever",
        category: "pull",
        tier: 10,
        System: { unit: "sec", repsTarget: [1, 2, 3], xpGain: gain(10) },
        parentSlug: "front-lever-rows",
        description: "One arm front lever. S-RANK.",
        x: 900, y: 2500,
    },

    /* ═══════════════════════════════════════════════════════
       LEGS — 17
       ═══════════════════════════════════════════════════════ */
    {
        slug: "bodyweight-squat",
        name: "Bodyweight Squat",
        category: "legs",
        tier: 0,
        icon: "/SKILL_ICONS/squat.svg",
        System: { unit: "reps", repsTarget: [15, 30, 50], xpGain: gain(0) },
        parentSlug: null,
        description: "Foundation squat.",
        x: 2000, y: 2000,
    },

    /* ── Legs · Anterior ── */
    {
        slug: "split-squat",
        name: "Split Squat",
        category: "legs",
        tier: 1,
        System: { unit: "reps", repsTarget: [8, 15, 25], xpGain: gain(1) },
        parentSlug: "bodyweight-squat",
        description: "Static lunge foundation.",
        x: 1900, y: 2100,
    },
    {
        slug: "cossack-squat",
        name: "Cossack Squat",
        category: "legs",
        tier: 2,
        System: { unit: "reps", repsTarget: [5, 10, 15], xpGain: gain(2) },
        parentSlug: "split-squat",
        description: "Side-to-side deep squat. Unlocks mobility.",
        x: 1850, y: 2200,
    },
    {
        slug: "bulgarian-split-squat",
        name: "Bulgarian Split Squat",
        category: "legs",
        tier: 3,
        System: { unit: "reps", repsTarget: [6, 12, 20], xpGain: gain(3) },
        parentSlug: "cossack-squat",
        description: "Rear foot elevated.",
        x: 1800, y: 2300,
    },
    {
        slug: "assisted-pistol-squat",
        name: "Assisted Pistol Squat",
        category: "legs",
        tier: 4,
        System: { unit: "reps", repsTarget: [4, 8, 15], xpGain: gain(4) },
        parentSlug: "bulgarian-split-squat",
        description: "One leg, holding support.",
        x: 1750, y: 2400,
    },
    {
        slug: "full-pistol-squat",
        name: "Full Pistol Squat",
        category: "legs",
        tier: 5,
        System: { unit: "reps", repsTarget: [1, 3, 8], xpGain: gain(5) },
        parentSlug: "assisted-pistol-squat",
        description: "Full one-leg squat.",
        x: 1700, y: 2500,
    },
    {
        slug: "shrimp-squat",
        name: "Shrimp Squat",
        category: "legs",
        tier: 6,
        System: { unit: "reps", repsTarget: [1, 3, 6], xpGain: gain(6) },
        parentSlug: "full-pistol-squat",
        description: "Holding rear ankle.",
        x: 1600, y: 2600,
    },
    {
        slug: "dragon-squat",
        name: "Dragon Squat",
        category: "legs",
        tier: 7,
        System: { unit: "reps", repsTarget: [1, 2, 5], xpGain: gain(7) },
        parentSlug: "shrimp-squat",
        description: "Free leg back, no hands.",
        x: 1550, y: 2700,
    },
    {
        slug: "weighted-pistol-squat",
        name: "Weighted Pistol Squat",
        category: "legs",
        tier: 6,
        System: { unit: "reps", repsTarget: [1, 3, 6], xpGain: gain(6) },
        parentSlug: "full-pistol-squat",
        description: "Add weight, one leg.",
        x: 1850, y: 2600,
    },
    {
        slug: "jumping-pistol-squat",
        name: "Jumping Pistol Squat",
        category: "legs",
        tier: 7,
        System: { unit: "reps", repsTarget: [1, 2, 4], xpGain: gain(7) },
        parentSlug: "weighted-pistol-squat",
        description: "Explode from pistol bottom. S-RANK.",
        x: 1900, y: 2700,
    },

    /* ── Legs · Posterior ── */
    {
        slug: "glute-bridge",
        name: "Glute Bridge",
        category: "legs",
        tier: 1,
        System: { unit: "reps", repsTarget: [12, 20, 30], xpGain: gain(1) },
        parentSlug: "bodyweight-squat",
        description: "Hips up from floor.",
        x: 2100, y: 2100,
    },
    {
        slug: "single-leg-glute-bridge",
        name: "Single-Leg Glute Bridge",
        category: "legs",
        tier: 2,
        System: { unit: "reps", repsTarget: [8, 12, 20], xpGain: gain(2) },
        parentSlug: "glute-bridge",
        description: "One leg driving.",
        x: 2150, y: 2200,
    },
    {
        slug: "hamstring-sliders",
        name: "Hamstring Sliders / Walkouts",
        category: "legs",
        tier: 3,
        System: { unit: "reps", repsTarget: [6, 10, 15], xpGain: gain(3) },
        parentSlug: "single-leg-glute-bridge",
        description: "Kneeling slide. Hamstring load.",
        x: 2200, y: 2300,
    },
    {
        slug: "band-assisted-nordic-curl",
        name: "Band-Assisted Nordic Curl",
        category: "legs",
        tier: 4,
        System: { unit: "reps", repsTarget: [3, 6, 10], xpGain: gain(4) },
        parentSlug: "hamstring-sliders",
        description: "Banded for assist. Learning curve.",
        x: 2250, y: 2400,
    },
    {
        slug: "nordic-curl-negative",
        name: "Nordic Curl Negative",
        category: "legs",
        tier: 5,
        System: { unit: "reps", repsTarget: [3, 6, 10], xpGain: gain(5) },
        parentSlug: "band-assisted-nordic-curl",
        description: "5s eccentric from knees.",
        x: 2300, y: 2500,
    },
    {
        slug: "full-nordic-curl",
        name: "Full Nordic Curl",
        category: "legs",
        tier: 6,
        System: { unit: "reps", repsTarget: [2, 5, 10], xpGain: gain(6) },
        parentSlug: "nordic-curl-negative",
        description: "Floor to upright. Full range.",
        x: 2350, y: 2600,
    },
    {
        slug: "weighted-nordic-curl",
        name: "Weighted Nordic Curl",
        category: "legs",
        tier: 7,
        System: { unit: "reps", repsTarget: [1, 3, 5], xpGain: gain(7) },
        parentSlug: "full-nordic-curl",
        description: "Nordic with load. S-RANK.",
        x: 2400, y: 2700,
    },

    /* ═══════════════════════════════════════════════════════
       CORE — 16
       ═══════════════════════════════════════════════════════ */
    {
        slug: "plank",
        name: "Plank",
        category: "core",
        tier: 0,
        icon: "/SKILL_ICONS/plank.svg",
        System: { unit: "sec", repsTarget: [20, 45, 90], xpGain: gain(0) },
        parentSlug: null,
        description: "Foundation core hold.",
        x: 2000, y: 2000,
    },
    {
        slug: "hollow-body-hold",
        name: "Hollow Body Hold",
        category: "core",
        tier: 1,
        System: { unit: "sec", repsTarget: [20, 40, 60], xpGain: gain(1) },
        parentSlug: "plank",
        description: "Banana shape, spine down. Fork.",
        x: 2000, y: 1900,
    },

    /* ── Core · Pike / Manna ── */
    {
        slug: "seated-pike-compression",
        name: "Seated Pike Compression",
        category: "core",
        tier: 2,
        System: { unit: "reps", repsTarget: [8, 15, 25], xpGain: gain(2) },
        parentSlug: "hollow-body-hold",
        description: "Sit, pike, compress legs.",
        x: 1900, y: 1800,
    },
    {
        slug: "tuck-l-sit",
        name: "Tuck L-Sit",
        category: "core",
        tier: 3,
        System: { unit: "sec", repsTarget: [10, 20, 40], xpGain: gain(3) },
        parentSlug: "seated-pike-compression",
        description: "Knees tucked, hips lifted.",
        x: 1850, y: 1700,
    },
    {
        slug: "full-l-sit",
        name: "Full L-Sit",
        category: "core",
        tier: 4,
        System: { unit: "sec", repsTarget: [5, 15, 30], xpGain: gain(4) },
        parentSlug: "tuck-l-sit",
        description: "Legs out at 90°.",
        x: 1800, y: 1600,
    },
    {
        slug: "straddle-l-sit",
        name: "Straddle L-Sit",
        category: "core",
        tier: 5,
        System: { unit: "sec", repsTarget: [5, 12, 25], xpGain: gain(5) },
        parentSlug: "full-l-sit",
        description: "Legs wide. Higher compression.",
        x: 1750, y: 1500,
    },
    {
        slug: "v-sit",
        name: "V-Sit",
        category: "core",
        tier: 6,
        System: { unit: "sec", repsTarget: [3, 8, 15], xpGain: gain(6) },
        parentSlug: "straddle-l-sit",
        description: "Legs above horizontal.",
        x: 1700, y: 1400,
    },
    {
        slug: "high-v-sit",
        name: "High V-Sit / Manna Prep",
        category: "core",
        tier: 7,
        System: { unit: "sec", repsTarget: [2, 5, 10], xpGain: gain(7) },
        parentSlug: "v-sit",
        description: "Legs near vertical.",
        x: 1650, y: 1300,
    },
    {
        slug: "manna",
        name: "Manna",
        category: "core",
        tier: 8,
        System: { unit: "sec", repsTarget: [1, 2, 5], xpGain: gain(8) },
        parentSlug: "high-v-sit",
        description: "Legs above hips, hands on floor. S-RANK.",
        x: 1600, y: 1200,
    },

    /* ── Core · Anti-extension ── */
    {
        slug: "hollow-body-rocks",
        name: "Hollow Body Rocks",
        category: "core",
        tier: 2,
        System: { unit: "reps", repsTarget: [10, 20, 30], xpGain: gain(2) },
        parentSlug: "hollow-body-hold",
        description: "Rock on your back. Hollow shape.",
        x: 2000, y: 1800,
    },
    {
        slug: "dragon-flag-negative",
        name: "Dragon Flag Negative",
        category: "core",
        tier: 3,
        System: { unit: "reps", repsTarget: [3, 6, 10], xpGain: gain(3) },
        parentSlug: "hollow-body-rocks",
        description: "Lower body slow from top.",
        x: 2000, y: 1700,
    },
    {
        slug: "full-dragon-flag",
        name: "Full Dragon Flag",
        category: "core",
        tier: 4,
        System: { unit: "reps", repsTarget: [2, 5, 10], xpGain: gain(4) },
        parentSlug: "dragon-flag-negative",
        description: "Body straight. Only shoulders down.",
        x: 2000, y: 1600,
    },

    /* ── Core · Hanging ── */
    {
        slug: "hanging-knee-raise",
        name: "Hanging Knee Raise",
        category: "core",
        tier: 2,
        System: { unit: "reps", repsTarget: [8, 15, 25], xpGain: gain(2) },
        parentSlug: "hollow-body-hold",
        description: "Knees to chest from hang.",
        x: 2100, y: 1800,
    },
    {
        slug: "hanging-leg-raise",
        name: "Hanging Leg Raise",
        category: "core",
        tier: 3,
        System: { unit: "reps", repsTarget: [5, 10, 15], xpGain: gain(3) },
        parentSlug: "hanging-knee-raise",
        description: "Straight legs to bar.",
        x: 2100, y: 1700,
    },
    {
        slug: "bent-knee-windshield-wipers",
        name: "Bent-Knee Windshield Wipers",
        category: "core",
        tier: 4,
        System: { unit: "reps", repsTarget: [3, 6, 10], xpGain: gain(4) },
        parentSlug: "hanging-leg-raise",
        description: "Knees bent, side to side.",
        x: 2100, y: 1600,
    },
    {
        slug: "full-hanging-windshield-wipers",
        name: "Full Hanging Windshield Wipers",
        category: "core",
        tier: 5,
        System: { unit: "reps", repsTarget: [1, 3, 6], xpGain: gain(5) },
        parentSlug: "bent-knee-windshield-wipers",
        description: "Legs straight, side to side.",
        x: 2100, y: 1500,
    },
];

/* =========================================================
   HELPERS
   ========================================================= */

export function getSkill(slug: string): Skill | undefined {
    return SKILLS.find((s) => s.slug === slug);
}

export function getRootSkills(): Skill[] {
    return SKILLS.filter((s) => s.parentSlug === null);
}

export function getChildrenOf(slug: string): Skill[] {
    return SKILLS.filter((s) => s.parentSlug === slug);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
    return SKILLS.filter((s) => s.category === category);
}

export function getSkillsByTier(tier: number): Skill[] {
    return SKILLS.filter((s) => s.tier === tier);
}

export function getXpGainForTier(tier: number): number {
    return XP_GAIN_BY_TIER[tier] ?? 0;
}

export function getPowerRangeForSkill(skill: Skill) {
    const tierConfig = POWER_TIERS.find((t) => t.tier === skill.tier);
    return {
        min: tierConfig?.minPower ?? 10,
        max: tierConfig?.maxPower ?? 150,
    };
}

export function getSkillPower(skill: Skill, bestSet: number): number {
    const { min, max } = getPowerRangeForSkill(skill);
    const targets = skill.System.repsTarget;

    if (bestSet <= targets[0]) return min;
    if (bestSet >= targets[targets.length - 1]) return max;

    for (let i = 0; i < targets.length - 1; i++) {
        if (bestSet >= targets[i] && bestSet <= targets[i + 1]) {
            const bracketMin = min + ((max - min) * i) / (targets.length - 1);
            const bracketMax = min + ((max - min) * (i + 1)) / (targets.length - 1);
            const ratio = (bestSet - targets[i]) / (targets[i + 1] - targets[i]);
            return Math.round(bracketMin + (bracketMax - bracketMin) * ratio);
        }
    }

    return min;
}

export function isDescendantOf(slug: string, ancestorSlug: string): boolean {
    let current = getSkill(slug);
    while (current?.parentSlug) {
        if (current.parentSlug === ancestorSlug) return true;
        current = getSkill(current.parentSlug);
    }
    return false;
}
