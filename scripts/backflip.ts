import "dotenv/config";
import { db } from "../src/prisma/db";
import { getSkill } from "../src/lib/skills/skills";
import { stateFor, xpForState } from "../src/lib/user/helpers";

async function backfillXp() {
    const users = await db.orm.public.User.where({}).all();
    console.log(`Processing ${users.length} users...`);

    let processed = 0;

    for (const [i, user] of users.entries()) {
        const skills = await db.orm.public.UserSkill
            .where({ userId: user.id })
            .all();

        let newSkillXp = 0;

        for (const row of skills) {
            const skill = getSkill(row.skillSlug);
            if (!skill) continue;

            const state = stateFor(row.bestSet, skill.System.repsTarget);
            const xp = xpForState(skill.System.xpGain, state);
            newSkillXp += xp;
        }

        const xpRow = await db.orm.public.UserXP
            .where({ userId: user.id })
            .first();

        const streakXp = xpRow?.streakXp ?? 0;
        const newTotalXp = newSkillXp + streakXp;

        if (xpRow) {
            await db.orm.public.UserXP
                .where({ userId: user.id })
                .update({
                    skillXp: newSkillXp,
                    totalXp: newTotalXp,
                    todayPower: 0,
                    todayDate: null,
                });
        } else {
            await db.orm.public.UserXP.create({
                userId: user.id,
                skillXp: newSkillXp,
                streakXp: 0,
                totalXp: newTotalXp,
                todayPower: 0,
                todayDate: null,
            });
        }

        processed++;
        if (processed % 100 === 0) {
            console.log(`  ${processed}/${users.length}`);
        }
    }

    console.log(`Backfill complete. Processed ${processed} users.`);
}

backfillXp()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Backfill failed:", err);
        process.exit(1);
    });