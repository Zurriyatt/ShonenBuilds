import { POWER_TIERS } from "../world/MPS";

/* =========================================================
   TYPES
   ========================================================= */
export type SkillCategory = "push" | "pull" | "legs" | "core";

export interface Skill {
    slug: string;
    name: string;
    category: SkillCategory;
    tier: number;  
    imagePath? :string;           // which tier this skill unlocks at
    parentSlug: string | null; // null = root node
    xpOnUnlock: number;        // one-time XP award
    repTargets: number[];      // progress milestones within the skill
    description: string;
}

/* =========================================================
   SKILLS — 8 total (2 per category)
   Tier 0 = entry / root. Tier 1 = second skill in chain.
   ========================================================= */
export const SKILLS: Skill[] = [
    /* ─── PUSH ─────────────────────────────────────────── */
    {
        slug: "knee-push-up",
        name: "Knee Push-Up",
        category: "push",
        tier: 0,
        parentSlug: null,
        xpOnUnlock: 50,
        repTargets: [5, 15, 30],
        description: "Entry push. Knees on the floor, full range.",
    },
    {
        slug: "standard-push-up",
        name: "Push Up",
        imagePath : '/pushup.svg',
        category: "push",
        tier: 1,
        parentSlug: "knee-push-up",
        xpOnUnlock: 100,
        repTargets: [10, 20, 35],
        description: "The full push-up. Flat back, chest to floor.",
    },

    /* ─── PULL ─────────────────────────────────────────── */
    {
        slug: "dead-hang",
        name: "Dead Hang",
        category: "pull",
        tier: 0,
        parentSlug: null,
        xpOnUnlock: 50,
        repTargets: [15, 30, 60], // seconds
        description: "Grip the bar. Hang. Builds grip + shoulder foundation.",
    },
    {
        slug: "australian-pull-up",
        name: "Australian Pull-Up",
        category: "pull",
        tier: 1,
        parentSlug: "dead-hang",
        xpOnUnlock: 100,
        repTargets: [8, 15, 25],
        description: "Bar at waist height, body at 45°. Horizontal row.",
    },

    /* ─── LEGS ─────────────────────────────────────────── */
    {
        slug: "bodyweight-squat",
        name: "Bodyweight Squat",
        category: "legs",
        tier: 0,
        parentSlug: null,
        xpOnUnlock: 50,
        repTargets: [15, 30, 50],
        description: "The foundation. Sit back, chest up, full depth.",
    },
    {
        slug: "jump-squat",
        name: "Jump Squat",
        category: "legs",
        tier: 1,
        parentSlug: "bodyweight-squat",
        xpOnUnlock: 100,
        repTargets: [10, 20, 30],
        description: "Explosive squat. Builds power, not just endurance.",
    },

    /* ─── CORE ─────────────────────────────────────────── */
    {
        slug: "plank",
        name: "Plank",
        category: "core",
        tier: 0,
        parentSlug: null,
        xpOnUnlock: 50,
        repTargets: [30, 60, 120], // seconds
        description: "The foundation. Straight line, tight core.",
    },
    {
        slug: "hollow-body-hold",
        name: "Hollow Body Hold",
        category: "core",
        tier: 1,
        parentSlug: "plank",
        xpOnUnlock: 100,
        repTargets: [20, 40, 60], // seconds
        description: "Lower back pressed down, arms + legs off floor.",
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

/** Power range for a skill = its tier's universal range. */
export function getPowerRangeForSkill(skill: Skill) {
    const tierConfig = POWER_TIERS.find((t) => t.tier === skill.tier);
    return {
        min: tierConfig?.minPower ?? 10,
        max: tierConfig?.maxPower ?? 150,
    };
}

/**
 * Power contribution from a single skill.
 * Interpolates between min/max based on rep position.
 */
export function getSkillPower(skill: Skill, bestSet: number): number {
    const { min, max } = getPowerRangeForSkill(skill);
    const targets = skill.repTargets;

    // Below first target → stay at min
    if (bestSet <= targets[0]) return min;

    // Above last target → cap at max
    if (bestSet >= targets[targets.length - 1]) return max;

    // Find bracket between targets and interpolate
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

/** Is `slug` a descendant of `ancestorSlug`? (for unlock checks) */
export function isDescendantOf(slug: string, ancestorSlug: string): boolean {
    let current = getSkill(slug);
    while (current?.parentSlug) {
        if (current.parentSlug === ancestorSlug) return true;
        current = getSkill(current.parentSlug);
    }
    return false;
}