import { type SkillState } from "./helpers.js";
import { stateFor } from "./helpers.js";
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


export function skillPower(skillTier: number, state: SkillState): number {
    const gain = POWER_PER_SKILL_BY_TIER[skillTier] ?? 0;
    if (state === "mastered") return gain;
    if (state === "in_progress") return Math.round(2*gain / 3);
    if (state === "unlocked") return Math.round(gain/3);
    return 0;
}
