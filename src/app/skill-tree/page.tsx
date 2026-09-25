// app/skill-tree/page.tsx
"use client";

import { getSkillsByCategory, getSkill } from "@/lib/skills/skills";
import { useUser } from "@/lib/auth/UserProvider";

export default function SkillTreePage() {
    const { user } = useUser();
    const pushSkills = getSkillsByCategory("push");

    return (
        <div className="p-4">
            <h1 className="font-display font-bold text-xl text-foreground mb-4">
                Push Progression
            </h1>
            {pushSkills.map((skill) => (
                <div key={skill.slug} className="flex items-center gap-3 py-2">
                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-xl">
                        {skill.icon}
                    </div>
                    <div>
                        <div className="text-foreground font-body font-bold">{skill.name}</div>
                        <div className="text-xs text-muted-foreground">
                            Tier {skill.tier} · {skill.repTargets.join("/")} reps
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}