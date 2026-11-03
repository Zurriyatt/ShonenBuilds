import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_L_URL!,
    token: process.env.UPSTASH_REDIS_L_SECRET!,
});
;

export async function GET() {
    try {
      console.log("entered")
        // 1. Get Top 100 IDs (highest score first)
        const topXpIds = await redis.zrange("users:by_xp", 0, 99, { rev: true }) as string[];
        console.log(topXpIds);
        // 2. Edge Case: If no data exists yet
        if (!topXpIds || topXpIds.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // 3. Fetch all profiles in one go
        const profiles = await redis.mget(...topXpIds.map(id => `user:${id}`));
        console.log(profiles, topXpIds, "redis getting leaderboard");
        // 4. Return the data, filtering out any nulls (if a user was deleted)
        return NextResponse.json({
            success: true,
            data: profiles.filter(Boolean) 
        });

    } catch (err) {
        console.error("[Leaderboard API] Error:", err);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}