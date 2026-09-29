// src/lib/auth/verify.ts

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/prisma/db";
import { authToken } from "@/app/api/auth/login/route";

import { updateStreak } from "../user/streak";
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables");
}

export interface User {
    userId: string;
    email: string;
    name: string;
    username: string;
    goal: string;
    why: string;
    world: string;
    path: string;
    // Progression
    xp: number;
    level: number;
    tier: number;
    powerLevel: number;
    currentStreak: number;
    longestStreak: number;
    totalWorkouts: number;
    sessionId: string;
    // Milestone (transient — only set on the day a milestone is hit)
    milestoneHit: number | null;
    milestoneBonus: number;
}

export async function authVerify({ req }: { req: NextRequest }) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get("authToken");
        if (!cookieToken) return { success: false, data: null };

        let Token: authToken;
        try {
            Token = jwt.verify(cookieToken.value, JWT_SECRET) as authToken;
        } catch {
            return { success: false, data: null, error: "Invalid token" };
        }

        if (!Token) {
            return { success: false, data: null, error: "You are not logged in!" };
        }

        // 1. User must exist
        const user = await db.orm.public.User.where({ id: Token.userId }).first();
        if (!user) {
            return { success: false, data: null, error: "You are not logged in!" };
        }

        // 2. Session must exist
        const session = await db.orm.public.Session.where({ id: Token.sessionId }).first();
        if (!session) {
            return { success: false, data: null, error: "You are not logged in!" };
        }

        // 3. Session must not be expired
        if (session.expiresAt.epochMilliseconds <= Date.now()) {
            await db.orm.public.Session.delete({ id: session.id });
            return { success: false, data: null, error: "Login expired!" };
        }

        // 4. Streak update (cached — cheap on repeat calls same day)
        const timezone = req.headers.get("x-user-timezone");
        const streak = await updateStreak(user.id, timezone);

        // 5. UserXP — the single source of truth for total XP
        const xpRow = await db.orm.public.UserXP.where({ userId: user.id }).first();
        const totalXp = xpRow?.totalXp ?? 0;

        // 6. Derive level / tier from totalXp
        const { getLevelFromXp, getTierFromLevel } = await import("@/lib/world/MPS");
        const level = getLevelFromXp(totalXp);
        const tier = getTierFromLevel(level);

        return {
            success: true,
            data: {
                userId: user.id,
                email: user.email,
                sessionId: session.id,
                name: user.name,
                username: user.username,
                goal: user.goal,
                why: user.why,
                world: user.world,
                path: user.path,
                xp: totalXp,
                level,
                tier,
                powerLevel: xpRow?.totalXp ?? 0, // placeholder — swap for real power calc later
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                totalWorkouts: 0, // derive later if needed
                milestoneHit: streak.milestoneHit,
                milestoneBonus: streak.milestoneBonus,
            },
        };
    } catch (err) {
        return {
            success: false,
            data: null,
            error: err instanceof Error ? err.message : "Server Error!",
        };
    }
}
