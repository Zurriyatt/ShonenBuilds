import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";

interface UserSkillRow {
    skillSlug: string;
    bestSet: number;
    masteredAt: { toString(): string } | null;
}

/* =========================================================
   GET /api/skills/mine

   Returns all UserSkill rows for the current user.
   Used by the skill tree page to derive state per node.

   skipStreak: true — this route only reads data, never
   advances the streak. Only /api/auth/verify touches it.
   ========================================================= */

export async function GET(request: NextRequest) {
    try {
        const auth = await  authVerify({ req: request, skipStreak: true });

        if (!auth.success || !auth.data) {
            console.log('failedlogin',auth)
            return NextResponse.json(
                { success: false, error: "Not logged in" },
                { status: 401 },
            );
        }

        const rows = await db.orm.public.UserSkill
            .where({ userId: auth.data.userId })
            .all();

        return NextResponse.json({
            success: true,
            data: {
                skills: (rows as UserSkillRow[]).map((r) => ({
                    skillSlug: r.skillSlug,
                    bestSet: r.bestSet,
                    masteredAt: r.masteredAt ? r.masteredAt.toString() : null,
                })),
            },
        });
    } catch (err) {
        console.error("Fetch skills error:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 },
        );
    }
}
