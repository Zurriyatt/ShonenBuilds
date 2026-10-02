"use client";

import { useState } from "react";
import { useUser } from "@/lib/auth/UserProvider";
import {
    POWER_TIERS,
    WORLD_CONFIG,
    RANKS_CONFIG,
    getRankName,
    getWorld,
    getTierFromLevel,
} from "@/lib/world/MPS";
import { useRouter } from "next/navigation";

type WorldId = keyof typeof WORLD_CONFIG;

/* =========================================================
   RANKS PAGE

   Three sections:
     1. Your Rank — hero card with current rank + progress
     2. Your Ladder — 11 tiers of your world+path as timeline
     3. Explore Other Worlds — tabs + full ladder per path

   Design intent: answer "where am I?" first, then
   "what's above me?", then "what else exists?".
   ========================================================= */

export default function RanksPage() {
    const router = useRouter();
    const { user } = useUser();

    // Which world is being explored in the tabs (defaults to user's world)
    const [exploreWorld, setExploreWorld] = useState<WorldId>(
        (user?.world as WorldId) || "shinobi",
    );

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground font-body">
                Loading...
            </div>
        );
    }

    const userWorld = getWorld(user.world);
    const userTier = getTierFromLevel(user.level);
    const userRank = getRankName(user.world, user.path, userTier);
    const nextRank = getRankName(user.world, user.path, userTier + 1);

    const exploreWorldConfig = getWorld(exploreWorld);

    return (
        <>
            {/* ═══════ Sticky header ═══════ */}
            <div
                className="sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8"
                style={{
                    height: 52,
                    background: "color-mix(in srgb, var(--background) 92%, transparent)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[12px] font-body">Back</span>
                </button>
                <span className="font-display font-bold text-[13px] tracking-[0.12em] text-foreground/70 uppercase">
                    Ranks
                </span>
                <div className="w-8 h-8" />
            </div>

            <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6 flex flex-col gap-8">

                {/* ═══════ 1. YOUR RANK — HERO ═══════ */}
                <section
                    className="relative overflow-hidden rounded-3xl p-6 lg:p-8 flex flex-col items-center gap-4"
                    style={{
                        background: `linear-gradient(160deg, ${userWorld.glow} 0%, color-mix(in srgb, var(--card) 98%, transparent) 60%)`,
                        border: `1.5px solid ${userWorld.border}`,
                        boxShadow: `0 0 40px ${userWorld.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                    }}
                >
                    <span className="text-[10px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                        Your Current Rank
                    </span>

                    <div
                        className="px-6 py-3 rounded-full flex items-center gap-3"
                        style={{
                            background: userWorld.glow,
                            border: `1.5px solid ${userWorld.border}`,
                            boxShadow: `0 0 30px ${userWorld.glow}, inset 0 0 16px ${userWorld.glow}`,
                        }}
                    >
                        <span className="text-[18px]">{userWorld.icon}</span>
                        <span
                            className="font-display font-bold text-[18px] lg:text-[22px] tracking-[0.08em] uppercase"
                            style={{ color: userWorld.color }}
                        >
                            {userRank}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[12px] font-body text-muted-foreground">
                        <span>Tier {userTier} of 10</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>{userWorld.display}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="capitalize">{user.path}</span>
                    </div>

                    {nextRank !== "Unknown" && (
                        <div className="flex flex-col items-center gap-1 mt-2">
                            <span className="text-[10px] font-body tracking-[0.1em] uppercase text-muted-foreground/50">
                                Next up
                            </span>
                            <span className="text-[13px] font-body font-semibold" style={{ color: userWorld.color }}>
                                {nextRank}
                            </span>
                        </div>
                    )}
                </section>

                {/* ═══════ 2. YOUR LADDER ═══════ */}
                <section className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                            Your Ladder
                        </span>
                        <h2 className="font-display font-bold text-[22px] lg:text-[28px] leading-tight tracking-[-0.02em] text-foreground">
                            Climb from {RANKS_CONFIG[user.world]?.[user.path]?.[0] ?? "—"} to{" "}
                            {RANKS_CONFIG[user.world]?.[user.path]?.[10] ?? "—"}
                        </h2>
                        <p className="text-[12px] font-body text-muted-foreground">
                            Every 10 levels pushes you one tier up. 11 tiers total.
                        </p>
                    </div>

                    <div className="flex flex-col">
                        {POWER_TIERS.map((tier, i) => {
                            const rankName = getRankName(user.world, user.path, tier.tier);
                            const isCurrent = tier.tier === userTier;
                            const isPassed = tier.tier < userTier;
                            const isLast = i === POWER_TIERS.length - 1;

                            return (
                                <div key={tier.tier} className="flex items-stretch gap-3">
                                    {/* Timeline rail */}
                                    <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{
                                                background: isCurrent
                                                    ? userWorld.color
                                                    : isPassed
                                                      ? `color-mix(in srgb, ${userWorld.color} 60%, var(--card))`
                                                      : "var(--border)",
                                                boxShadow: isCurrent ? `0 0 12px ${userWorld.color}` : "none",
                                                border: `2px solid ${isCurrent ? userWorld.color : "var(--background)"}`,
                                                marginTop: 18,
                                            }}
                                        />
                                        {!isLast && (
                                            <div
                                                className="w-[2px] flex-1"
                                                style={{
                                                    background: isPassed
                                                        ? `color-mix(in srgb, ${userWorld.color} 40%, transparent)`
                                                        : "var(--border)",
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Row content */}
                                    <div
                                        className="flex-1 rounded-2xl px-4 lg:px-5 py-3.5 lg:py-4 my-1 transition-all"
                                        style={{
                                            background: isCurrent
                                                ? `linear-gradient(135deg, ${userWorld.glow} 0%, color-mix(in srgb, var(--card) 96%, transparent) 100%)`
                                                : "var(--card)",
                                            border: isCurrent
                                                ? `1.5px solid ${userWorld.border}`
                                                : "1px solid var(--border)",
                                            boxShadow: isCurrent ? `0 0 24px ${userWorld.glow}` : "none",
                                            opacity: !isPassed && !isCurrent ? 0.7 : 1,
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span
                                                    className="font-display font-bold text-[12px] tracking-[0.08em] uppercase shrink-0"
                                                    style={{
                                                        color: isCurrent
                                                            ? userWorld.color
                                                            : isPassed
                                                              ? `color-mix(in srgb, ${userWorld.color} 70%, var(--muted-foreground))`
                                                              : "var(--muted-foreground)",
                                                    }}
                                                >
                                                    T{tier.tier}
                                                </span>
                                                <span
                                                    className="font-display font-bold text-[15px] lg:text-[17px] tracking-[-0.01em] truncate"
                                                    style={{
                                                        color: isCurrent
                                                            ? userWorld.color
                                                            : isPassed
                                                              ? "var(--foreground)"
                                                              : "var(--muted-foreground)",
                                                    }}
                                                >
                                                    {rankName}
                                                </span>
                                                {isCurrent && (
                                                    <span
                                                        className="text-[9px] font-body font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full shrink-0"
                                                        style={{
                                                            background: userWorld.glow,
                                                            border: `1px solid ${userWorld.border}`,
                                                            color: userWorld.color,
                                                        }}
                                                    >
                                                        You are here
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 lg:gap-4 text-[10px] lg:text-[11px] font-body text-muted-foreground shrink-0">
                                                <span>L{tier.minLevel}–{tier.maxLevel}</span>
                                                <span className="text-muted-foreground/30 hidden sm:inline">·</span>
                                                <span className="hidden sm:inline">
                                                    {tier.minPower.toLocaleString()}–
                                                    {tier.maxPower === Infinity ? "∞" : tier.maxPower.toLocaleString()} PL
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ═══════ 3. EXPLORE OTHER WORLDS ═══════ */}
                <section className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                            Explore Other Worlds
                        </span>
                        <h2 className="font-display font-bold text-[22px] lg:text-[28px] leading-tight tracking-[-0.02em] text-foreground">
                            Every world has its own rank path
                        </h2>
                    </div>

                    {/* World tabs */}
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(WORLD_CONFIG) as WorldId[]).map((wid) => {
                            const w = WORLD_CONFIG[wid];
                            const active = wid === exploreWorld;
                            return (
                                <button
                                    key={wid}
                                    onClick={() => setExploreWorld(wid)}
                                    className="px-3.5 py-2 rounded-xl flex items-center gap-2 text-[12px] font-body font-semibold transition-all active:scale-95"
                                    style={{
                                        background: active ? w.glow : "var(--card)",
                                        border: active ? `1.5px solid ${w.border}` : "1px solid var(--border)",
                                        color: active ? w.color : "var(--muted-foreground)",
                                    }}
                                >
                                    <span className="text-[14px]">{w.icon}</span>
                                    <span>{w.display.replace(" World", "")}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Paths within selected world */}
                    {exploreWorldConfig && (
                        <div className="flex flex-col gap-6">
                            {exploreWorldConfig.paths.map((p) => {
                                const ranksForPath = RANKS_CONFIG[exploreWorld]?.[p.id] ?? [];
                                const isUserPath =
                                    exploreWorld === user.world && p.id === user.path;

                                return (
                                    <div key={p.id} className="flex flex-col gap-3">
                                        {/* Path header */}
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[18px]">{p.icon}</span>
                                                <span className="font-display font-bold text-[15px] tracking-[-0.01em] text-foreground">
                                                    {p.name}
                                                </span>
                                                {isUserPath && (
                                                    <span
                                                        className="text-[9px] font-body font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
                                                        style={{
                                                            background: exploreWorldConfig.glow,
                                                            border: `1px solid ${exploreWorldConfig.border}`,
                                                            color: exploreWorldConfig.color,
                                                        }}
                                                    >
                                                        Your Path
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-body text-muted-foreground">
                                                {p.tagline}
                                            </span>
                                        </div>

                                        {/* Rank list — compact grid */}
                                        <div
                                            className="rounded-2xl overflow-hidden"
                                            style={{ border: "1px solid var(--border)" }}
                                        >
                                            {ranksForPath.map((rankName, tierIdx) => {
                                                const isCurrent =
                                                    isUserPath && tierIdx === userTier;
                                                return (
                                                    <div
                                                        key={tierIdx}
                                                        className="flex items-center gap-3 px-4 py-2.5"
                                                        style={{
                                                            borderBottom:
                                                                tierIdx < ranksForPath.length - 1
                                                                    ? "1px solid var(--border)"
                                                                    : "none",
                                                            background: isCurrent
                                                                ? exploreWorldConfig.glow
                                                                : tierIdx % 2 === 0
                                                                  ? "color-mix(in srgb, var(--card) 70%, transparent)"
                                                                  : "color-mix(in srgb, var(--background) 50%, transparent)",
                                                        }}
                                                    >
                                                        <span
                                                            className="font-display font-bold text-[11px] tracking-[0.06em] uppercase shrink-0"
                                                            style={{
                                                                color: isCurrent
                                                                    ? exploreWorldConfig.color
                                                                    : "var(--muted-foreground)",
                                                                minWidth: 22,
                                                            }}
                                                        >
                                                            T{tierIdx}
                                                        </span>
                                                        <span
                                                            className="font-body text-[13px] truncate"
                                                            style={{
                                                                color: isCurrent
                                                                    ? exploreWorldConfig.color
                                                                    : "var(--foreground/80)",
                                                                fontWeight: isCurrent ? 600 : 400,
                                                            }}
                                                        >
                                                            {rankName}
                                                        </span>
                                                        {isCurrent && (
                                                            <span
                                                                className="ml-auto text-[9px] font-body font-bold tracking-[0.1em] uppercase shrink-0"
                                                                style={{ color: exploreWorldConfig.color }}
                                                            >
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <div className="h-8" />
            </div>
        </>
    );
}
