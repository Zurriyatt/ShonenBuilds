// src/app/api/skills/log/route.ts

import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { logSkillReps } from "@/lib/user/skill-xp";

/* =========================================================
   POST /api/skills/log

   Body: { skillSlug: string, reps: number }

   Logs reps on a skill for the current user.
   Returns previous state, new state, XP delta, level flags.
   ========================================================= */

export async function POST(request: NextRequest) {
    try {
        /* ── 1. Auth ────────────────────────────────────────── */
        const auth = await authVerify({ req: request });

        if (!auth.success || !auth.data) {
            return NextResponse.json(
                { success: false, error: "Not logged in" },
                { status: 401 },
            );
        }

        /* ── 2. Parse + validate body ───────────────────────── */
        const body = await request.json();
        const { skillSlug, reps } = body as {
            skillSlug?: string;
            reps?: number;
        };

        if (!skillSlug || typeof reps !== "number") {
            return NextResponse.json(
                { success: false, error: "skillSlug and reps required" },
                { status: 400 },
            );
        }

        if (reps < 0 || reps > 10_000) {
            return NextResponse.json(
                { success: false, error: "reps out of range" },
                { status: 400 },
            );
        }

        /* ── 3. Log it ──────────────────────────────────────── */
        const result = await logSkillReps(auth.data.userId, skillSlug, reps);

        if (!result) {
            return NextResponse.json(
                { success: false, error: "Unknown skill" },
                { status: 404 },
            );
        }

        /* ── 4. Return ──────────────────────────────────────── */
        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (err) {
        console.error("Skill log error:", err);
        return NextResponse.json(
            { success: false, error: "Something went wrong" },
            { status: 500 },
        );
    }
}