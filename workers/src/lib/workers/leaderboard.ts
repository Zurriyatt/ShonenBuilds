import "dotenv/config";
import { Redis } from "@upstash/redis";
import { SKILLS } from "../ImportedFromCoreData/skills.js";
import { db } from "../../prisma/db.js"; // Standard Prisma 8 db export from src/prisma/db.ts
import { type Skill } from "../ImportedFromCoreData/skills.js";
import { skillPower } from "../ImportedFromCoreData/power.js";
import { stateFor } from "../ImportedFromCoreData/helpers.js";
import { IncomingMessage, ServerResponse } from "http";

const mySetMap: Map<string, Skill> = new Map();

SKILLS.forEach((skill) => {
    mySetMap.set(skill.slug, skill);
});

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_L_URL,
    token: process.env.UPSTASH_REDIS_L_SECRET,
});

interface L_CACHE_FORMAT {
    userId: string;
    userXp: number;
    userPower: number;
    name: string;
    username: string;
    world: string;
    path: string;
    streak: number;
}

export async function refreshLeaderBoard(req: IncomingMessage, res: ServerResponse) {
    try {
        let result;
        const batchSize = 100;
        let lastId: string | null = null;
        let hasMore = true;

        while (hasMore) {
            // 1. FIXED: Prisma 8 orderBy requires an accessor callback function
            let collection = db.orm.public.User.orderBy((u: any) => u.id.asc()).limit(batchSize);

            if (lastId) {
                const targetId = lastId; // Close over value for scope safety
                // FIXED: Operator filters must use function callbacks and native chain methods (.gt())
                collection = db.orm.public.User.where((u: any) => u.id.gt(targetId))
                    .orderBy((u: any) => u.id.asc())
                    .limit(batchSize);
            }

            // 2. Execute with .all() as required by Prisma 8
            const users: any[] = await collection.all();
            if (users.length === 0) break;

            // 3. Extract IDs
            const userIds = users.map((u: any) => u.id);

            // 4. FIXED: Bulk Fetch sets use functional callbacks with the .in() column method
            const allXp = await db.orm.public.UserXP.where((xp: any) => xp.userId.in(userIds)).all();
            const allSkills = await db.orm.public.UserSkill.where((s: any) => s.userId.in(userIds)).all();
            const allStreaks = await db.orm.public.UserStreak.where((st: any) => st.userId.in(userIds)).all();

            // 5. Process
            result = await Promise.allSettled(
                users.map(async (row: any) => {
                    const xp = allXp.find((xpRow: any) => xpRow.userId === row.id);
                    const skillRows = allSkills.filter((s: any) => s.userId === row.id);
                    const streak = allStreaks.find((eachRow: any) => eachRow.userId === row.id);
                    
                    let power = skillRows.reduce((acc: number, eachSkill: any) => {
                        const found = mySetMap.get(eachSkill.skillSlug) as Skill;
                        if (!found) return acc;

                        const state = stateFor(eachSkill.bestSet, found.System.repsTarget as [number, number, number]);
                        return acc + skillPower(found.tier, state);
                    }, 10);
                    power += (streak?.longestStreak ?? 0)*25;
                    const LParams: L_CACHE_FORMAT = {
                        userId: row.id,
                        userXp: xp?.totalXp ?? 0,
                        userPower: power,
                        name: row.name,
                        username: row.username,
                        world: row.world,
                        path: row.path,
                        streak: streak?.currentStreak ?? 0
                    };
                    await setCache({ LParams });
                }),
            );

            // 6. Pagination
            if (users.length === batchSize) {
                lastId = users[users.length - 1].id;
            } else {
                hasMore = false;
            }
        }

        console.log(result);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Done" }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false }));
    }
}

async function setCache({ LParams }: { LParams: L_CACHE_FORMAT }) {
    const { userId, userXp } = LParams;
    console.log(userId);
    const setting = await redis.set(`user:${userId}`, LParams);
    console.log(setting, 'setting');
    const range = await redis.zadd("users:by_xp", {
        score: userXp,
        member: userId,
    });
    console.log(range, 'range');
    return;
}
