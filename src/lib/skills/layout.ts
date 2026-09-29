import type { Skill, SkillCategory } from "./skills";
import { SKILLS } from "./skills";

/* =========================================================
   LAYOUT — computed by traversal, no hardcoded positions

   Direction layout (a clean cross):

                          CORE
                           ▲
                           │
                           │
         PULL ◀────────────┼────────────▶ PUSH
                           │
                           │
                           ▼
                          LEGS

   · PUSH grows east-northeast (~20° above horizontal)
   · PULL mirrors push west-northwest
   · CORE grows straight up
   · LEGS grows straight down

   Each category's anchor sits slightly off-center so the
   four trees stay visually separated at the center seam.
   ========================================================= */

/* =========================================================
   BRANCH LABELS — sub-section names for each fork branch.
   Position is anchored to a specific skill node + an offset,
   so labels follow the tree automatically.
   ========================================================= */

/* =========================================================
   BRANCH LABELS — hardcoded world-space positions.
   Canvas is 4000 × 4000 with center at (2000, 2000).
   Tune these by eye against the rendered tree.
   ========================================================= */

export interface BranchLabel {
    name: string;
    x: number;
    y: number;
    rotate:string;
}

export const BRANCH_LABELS: BranchLabel[] = [
    // PUSH side (east of center, spreading up-right)
    { name: "Vertical Push",    x: 2830, y: 1545 ,rotate: '-20deg'},
    { name: "Horizontal Push",  x: 2700, y: 1780 ,rotate: '-20deg'},
    { name: "One-Arm Push",     x: 2950, y: 1280 ,rotate: '-20deg'},

    // PULL side (west of center, spreading up-left)
    { name: "Vertical Pull",    x: 1050, y: 1880 ,rotate: '20deg'},
    { name: "Explosive Pull",   x: 900, y: 1620 ,rotate: '20deg'},
    { name: "Horizontal Pull",  x: 780, y: 1360 ,rotate: '20deg'},

    // CORE (north of center)
    { name: "Pike Core",        x: 2150, y: 1570 ,rotate: '90deg'},
    { name: "Lever Core",       x: 1980, y: 1240 ,rotate: '0deg'},
    { name: "Hanging Core",     x: 1510, y: 1300 ,rotate: '-90deg'},

    // LEGS (south of center)
    { name: "Pistol Legs",      x: 1935, y: 2450 ,rotate: '90deg'},
    { name: "Nordic Legs",      x: 1700, y: 2450 ,rotate: '90deg'},
];
const CANVAS_CENTER = 2000;

/* Distance between consecutive tiers along the growth axis.
   Bigger = more breathing room between tier rings. */
const TIER_STEP = 130;

/* Distance between adjacent leaf slots along the spread axis.
   Bigger = wider fan-out of sibling branches. */
const LEAF_GAP = 195;

interface Vec {
    x: number;
    y: number;
}

/* Pre-tuned direction vectors.

   step        → unit vector along the growth axis
   spread      → unit vector perpendicular to step (sibling fan-out)
   anchorOffset → where the category's root sits, relative to canvas center

   Push and Pull are mirror images across the vertical axis. */
const GROWTH: Record<SkillCategory, { step: Vec; spread: Vec; anchorOffset: Vec }> = {
    push: {
        step: { x: 0.94, y: -0.34 }, // ~20° above east
        spread: { x: 0.34, y: 0.94 }, // perpendicular, points down-right
        anchorOffset: { x: 50, y: -55 },
    },
    pull: {
        step: { x: -0.94, y: -0.34 }, // mirror of push
        spread: { x: -0.34, y: 0.94 }, // perpendicular, points down-left
        anchorOffset: { x: -150, y: -20 },
    },
    core: {
        step: { x: 0, y: -1 }, // straight up
        spread: { x: 1.2, y: 0 }, // horizontal fan-out
        anchorOffset: { x: -40, y: -150 },
    },
    legs: {
        step: { x: 0, y: 1 }, // straight down
        spread: { x: 1.5, y: 0 }, // horizontal fan-out
        anchorOffset: { x: 30, y: 40 },
    },
};

export interface Positioned {
    skill: Skill;
    x: number;
    y: number;
}

function layoutCategory(category: SkillCategory): Positioned[] {
    const skills = SKILLS.filter((s) => s.category === category);
    const g = GROWTH[category];

    /* ── 1. Build parent → children map ──────────────────── */
    const childrenOf = new Map<string | null, Skill[]>();
    for (const s of skills) {
        if (!childrenOf.has(s.parentSlug)) childrenOf.set(s.parentSlug, []);
        childrenOf.get(s.parentSlug)!.push(s);
    }
    for (const arr of childrenOf.values()) {
        arr.sort((a, b) => a.slug.localeCompare(b.slug));
    }

    /* ── 2. Assign a slot to every node (post-order DFS) ───
         Leaves take sequential integer slots.
         Parents take the midpoint of first & last child.   */
    const slotOf = new Map<string, number>();
    let nextSlot = 0;

    function assign(skill: Skill): number {
        const kids = childrenOf.get(skill.slug) ?? [];
        let slot: number;

        if (kids.length === 0) {
            slot = nextSlot;
            nextSlot++;
        } else {
            const childSlots = kids.map(assign);
            slot = (childSlots[0] + childSlots[childSlots.length - 1]) / 2;
        }

        slotOf.set(skill.slug, slot);
        return slot;
    }

    for (const root of skills.filter((s) => s.parentSlug === null)) {
        assign(root);
    }

    /* ── 3. Center slots around 0 so the category is symmetric ── */
    const all = Array.from(slotOf.values());
    const slotCenter = (Math.min(...all) + Math.max(...all)) / 2;

    /* ── 4. Anchor for this category ─────────────────────── */
    const anchor: Vec = {
        x: CANVAS_CENTER + g.anchorOffset.x,
        y: CANVAS_CENTER + g.anchorOffset.y,
    };

    /* ── 5. Final position = anchor + tier·step + slot·spread ── */
    return skills.map((skill) => {
        const slot = (slotOf.get(skill.slug) ?? 0) - slotCenter;
        const t = skill.tier;

        return {
            skill,
            x: anchor.x + g.step.x * t * TIER_STEP + g.spread.x * slot * LEAF_GAP,
            y: anchor.y + g.step.y * t * TIER_STEP + g.spread.y * slot * LEAF_GAP,
        };
    });
}

export function getLayout(): Positioned[] {
    const categories: SkillCategory[] = ["push", "pull", "core", "legs"];
    return categories.flatMap(layoutCategory);
}

/* =========================================================
   BOUNDS — useful for auto-fitting the camera viewport
   ========================================================= */
export interface LayoutBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
}

export function getLayoutBounds(layout: Positioned[], padding = 200): LayoutBounds {
    if (layout.length === 0) {
        return {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
            width: 0,
            height: 0,
            centerX: 0,
            centerY: 0,
        };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of layout) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding,
        width: maxX - minX + 2 * padding,
        height: maxY - minY + 2 * padding,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
    };
}

/* =========================================================
   CONNECTIONS — every parent → child pair
   ========================================================= */

export interface Connection {
    key: string;
    from: Positioned;
    to: Positioned;
}

export function getConnections(layout: Positioned[]): Connection[] {
    const bySlug = new Map(layout.map((p) => [p.skill.slug, p]));
    const out: Connection[] = [];

    for (const p of layout) {
        if (!p.skill.parentSlug) continue;
        const parent = bySlug.get(p.skill.parentSlug);
        if (!parent) continue;

        out.push({
            key: `${parent.skill.slug}->${p.skill.slug}`,
            from: parent,
            to: p,
        });
    }

    return out;
}
