export type SkillState = "unlocked" | "in_progress" | "mastered" | "available";

export function xpForState(xpGain: number, state: SkillState): number {
    if (state === "mastered") return xpGain;
    if (state === "in_progress") return Math.round((xpGain * 2) / 3);
    if (state === "unlocked") return Math.round(xpGain / 3);
    return 0; // available
}

export function stateFor(bestSet: number, repsTarget: [number, number, number]): SkillState {
    if (bestSet >= repsTarget[2]) return "mastered";
    if (bestSet >= repsTarget[1]) return "in_progress";
    if (bestSet >= repsTarget[0])return "unlocked";
    return "available";
}