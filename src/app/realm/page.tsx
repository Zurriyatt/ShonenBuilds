"use client";

import { useUser } from "@/lib/auth/UserProvider";
import {
    getWorld,
    getXpForLevel,
    getRankName,
    getXpRemainingForNextTier,
    getTierFromLevel,
    getXpforNextTier,
    POWER_TIERS,
} from "@/lib/world/MPS";
import { useRouter } from "next/navigation";

/* =========================================================
   STATIC DATA (placeholders until real activity tracking exists)
   ========================================================= */
const ACTIVITY = [
    { icon: "💪", label: "Push Day Complete", detail: "32 reps · max effort", xp: "+450 XP", time: "2h ago", color: "var(--primary)" },
    { icon: "🏃", label: "Morning Run · 5km", detail: "28:14 · Zone 3", xp: "+280 XP", time: "Yesterday", color: "var(--accent)" },
    { icon: "⚔️", label: "Rival Challenge Won", detail: "vs @kira_apex", xp: "+620 XP", time: "2d ago", color: "var(--gold)" },
];

const MINI_STATS = [
    { icon: "🌳", value: "34%", sub: "unlocked", label: "Skill Tree", color: "var(--primary)" },
    { icon: "🏆", value: "#1,247", sub: "global", label: "Leaderboard", color: "var(--gold)" },
    { icon: "⚡", value: "3", sub: "active", label: "Challenges", color: "var(--accent)" },
];

/*
 * LAYOUT
 * Mobile (< lg): unchanged single column — player → bars → mission → activity → stats → rival.
 * Desktop (≥ lg): two-column HUD.
 *   Left  (sticky "status window"): player card, power level, XP + tier bars.
 *   Right (operations): mission (wide, side-by-side content), stat cards row, activity, rival CTA.
 * Every desktop change is an `lg:` variant, so mobile output is identical to before.
 */

export default function Realm() {
    const router = useRouter();
    const USER_DATA = useUser();

    const world = getWorld(USER_DATA.user?.world as string);

    const rank = getRankName(
        USER_DATA.user?.world as string,
        USER_DATA.user?.path as string,
        USER_DATA.user?.tier as number,
    );

    const nextRank = getRankName(
        USER_DATA.user?.world as string,
        USER_DATA.user?.path as string,
        (USER_DATA.user?.tier as number) + 1,
    );

    const requiredXp = getXpForLevel((USER_DATA.user?.level as number) + 1);
    const tier = getTierFromLevel(USER_DATA.user?.level as number);
    const nextRequiedXp = getXpRemainingForNextTier(USER_DATA.user?.xp || 0, tier);
    const totalNextTierXp = getXpforNextTier(tier);

    /* Tier progress — 0% on entry, 100% at rank up */
    const currentTierMinLevel = POWER_TIERS.find((t) => t.tier === tier)?.minLevel ?? 1;
    const currentTierMinXp = getXpForLevel(currentTierMinLevel);
    const tierXpRange = totalNextTierXp - currentTierMinXp;
    const xpIntoCurrentTier = Math.max(0, (USER_DATA.user?.xp ?? 0) - currentTierMinXp);
    const tierProgress = tierXpRange > 0 ? Math.min(1, xpIntoCurrentTier / tierXpRange) : 1;

    const pathLabel =
        USER_DATA.user?.path === "ancient"
            ? "Ancient Clan"
            : USER_DATA.user?.path === "shinobi"
              ? "Shinobi"
              : (USER_DATA.user?.path as string);

    return (
        <>
            {/* ── Sticky header ── */}
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
                <span className="font-display font-bold text-[13px] lg:text-[14px] tracking-[0.12em] lg:tracking-[0.2em] text-foreground/70 uppercase">
                    Your Realm
                </span>
                <button
                    onClick={() => document.documentElement.classList.toggle("light")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.5" />
                        <path
                            d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.6 2.6l1.05 1.05M11.35 11.35l1.05 1.05M2.6 12.4l1.05-1.05M11.35 3.65l1.05-1.05"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>

            {USER_DATA.user ? (
                <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 lg:max-w-[1280px] lg:mx-auto lg:w-full lg:px-8 lg:py-8 lg:items-start">
                    {/* ═════════════ LEFT COLUMN — STATUS WINDOW ═════════════ */}
                    <aside className="flex flex-col lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[76px] lg:gap-4">
                        {/* ═══════ 1. PLAYER CARD + POWER LEVEL ═══════ */}
                        <div
                            className="relative overflow-hidden px-3 pt-7 pb-6 flex flex-col gap-4 items-center lg:rounded-3xl lg:px-6 lg:pt-8 lg:pb-8 lg:border lg:border-[var(--border)] lg:bg-[color-mix(in_srgb,var(--card)_60%,transparent)]"
                        >
                            <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    background: `radial-gradient(80% 60% at 50% 0%, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 70%)`,
                                }}
                            />
                            {/* Desktop-only HUD corner brackets */}
                            <div className="hidden lg:block pointer-events-none absolute inset-3">
                                <span className="absolute top-0 left-0 w-4 h-4 border-t border-l" style={{ borderColor: world.border }} />
                                <span className="absolute top-0 right-0 w-4 h-4 border-t border-r" style={{ borderColor: world.border }} />
                                <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l" style={{ borderColor: world.border }} />
                                <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r" style={{ borderColor: world.border }} />
                            </div>

                            <div className="flex flex-col items-center gap-4 relative z-10 w-full max-w-md mx-auto">
                                <div className="flex items-center gap-4">
                                    <div className="relative shrink-0" style={{ width: 84, height: 84 }}>
                                        <div
                                            className="absolute inset-[-3px] rounded-full"
                                            style={{
                                                background: `conic-gradient(${world.color} 0deg,${world.color} 270deg,var(--border) 270deg)`,
                                                borderRadius: "50%",
                                                filter: `drop-shadow(0 0 12px ${world.glow})`,
                                            }}
                                        />
                                        <div
                                            className="absolute inset-[3px] rounded-full flex items-center justify-center text-[36px]"
                                            style={{
                                                background: "linear-gradient(145deg, var(--secondary), var(--card))",
                                                border: "1px solid var(--border)",
                                            }}
                                        >
                                            {world.icon}
                                        </div>
                                        <div
                                            className="absolute bottom-[3px] right-[3px] w-3.5 h-3.5 rounded-full border-2"
                                            style={{
                                                background: "var(--gold)",
                                                borderColor: "var(--background)",
                                                boxShadow: `0 0 8px color-mix(in srgb, var(--gold) 80%, transparent)`,
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <span className="font-display font-bold text-[22px] leading-none tracking-[-0.02em] text-foreground">
                                            @{USER_DATA.user.username}
                                        </span>
                                        <div
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-full w-fit"
                                            style={{
                                                background: "color-mix(in srgb, var(--gold) 10%, transparent)",
                                                border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)",
                                            }}
                                        >
                                            <span className="text-[11px]">🔥</span>
                                            <span
                                                className="text-[11px] font-body font-bold tracking-[-0.01em]"
                                                style={{ color: "var(--gold)" }}
                                            >
                                                {USER_DATA.user.currentStreak}d
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 mt-1">
                                    <span className="text-[10px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                                        Rank
                                    </span>
                                    <div
                                        className="px-5 py-2 rounded-full flex items-center gap-2"
                                        style={{
                                            background: world.glow,
                                            border: `1.5px solid ${world.border}`,
                                            boxShadow: `0 0 24px ${world.glow}, inset 0 0 12px ${world.glow}`,
                                        }}
                                    >
                                        <span className="text-[14px]">{world.icon}</span>
                                        <span
                                            className="font-display font-bold text-[13px] tracking-[0.1em] uppercase"
                                            style={{ color: world.color }}
                                        >
                                            {rank}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5 w-full max-w-[320px] lg:max-w-none mt-2">
                                    <div
                                        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2"
                                        style={{
                                            background: "color-mix(in srgb, var(--card) 80%, transparent)",
                                            border: "1px solid var(--border)",
                                        }}
                                    >
                                        <span className="text-[16px]">
                                            {USER_DATA.user.path === "ancient" ? "🌊" : "🌪️"}
                                        </span>
                                        <span className="text-[8px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground/50">
                                            Path
                                        </span>
                                        <span className="text-[11px] font-body font-semibold text-foreground/80 text-center leading-tight">
                                            {pathLabel}
                                        </span>
                                    </div>

                                    <div
                                        className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-2"
                                        style={{
                                            background: "color-mix(in srgb, var(--card) 80%, transparent)",
                                            border: `1px solid color-mix(in srgb, ${world.color} 22%, var(--border))`,
                                        }}
                                    >
                                        <span className="text-[16px]">{world.icon}</span>
                                        <span className="text-[8px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground/50">
                                            World
                                        </span>
                                        <span
                                            className="text-[11px] font-body font-semibold text-center leading-tight"
                                            style={{ color: world.color }}
                                        >
                                            {world.display}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-7 lg:mt-6 flex flex-col items-center lg:w-full lg:pt-6 lg:border-t lg:border-[var(--border)]">
                                <span className="text-[10px] font-body font-semibold text-muted-foreground tracking-[0.24em] uppercase">
                                    Power Level
                                </span>
                                <span
                                    className="font-body font-bold leading-none tracking-[-0.045em] select-none mt-1.5"
                                    style={{
                                        fontSize: "clamp(64px,7vw,96px)",
                                        color: "var(--foreground)",
                                        textShadow: `0 0 64px ${world.glow}, 0 2px 0 rgba(0,0,0,0.5)`,
                                    }}
                                >
                                    {USER_DATA.user.powerLevel.toLocaleString()}
                                </span>
                                <span
                                    className="inline-flex items-center gap-1.5 text-[11px] font-body font-medium mt-2 tracking-[0.02em]"
                                    style={{ color: "var(--accent)" }}
                                >
                                    <span className="inline-block w-[2px] h-3 rounded-full" style={{ background: "var(--accent)" }} />
                                    +{(USER_DATA.user.todayPower ?? 0).toLocaleString()} today
                                </span>
                            </div>
                        </div>

                        {/* ═══════ 2. XP + TIER BARS ═══════ */}
                        <div className="px-4 lg:px-0 flex flex-col gap-3">
                            <div
                                className="rounded-2xl p-4 lg:p-5 flex flex-col gap-3"
                                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                            >
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[14px] lg:text-[12px] font-body font-bold text-foreground/60 tracking-widest uppercase">
                                            LEVEL {USER_DATA.user.level}
                                        </span>
                                        <div className="h-3 w-px bg-border" />
                                        <span className="text-[12px] lg:text-[11px] font-body font-medium text-muted-foreground flex-1">
                                            {USER_DATA.user.xp} / {requiredXp} XP
                                        </span>
                                        <span className="text-[14px] text-muted-foreground/60">⟶</span>
                                        <span className="text-[14px] lg:text-[12px] font-body font-bold text-foreground/60 tracking-widest uppercase">
                                            LEVEL {USER_DATA.user.level + 1}
                                        </span>
                                    </div>
                                    <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                                        <div
                                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-[1400ms] ease-out"
                                            style={{
                                                width: `${Math.min(100, (USER_DATA.user.xp / requiredXp) * 100)}%`,
                                                background: "linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)",
                                                boxShadow:
                                                    "0 0 10px color-mix(in srgb, var(--primary) 60%, transparent), 0 0 20px color-mix(in srgb, var(--accent) 25%, transparent), inset 0 1px 0 rgba(255,255,255,0.15)",
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 w-1/3 pointer-events-none"
                                                style={{
                                                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)",
                                                    animation: "glow-slide 2s ease 1.6s both",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-body">
                                        {requiredXp - USER_DATA.user.xp} XP until next level
                                    </p>
                                </div>

                                <div className="h-px" style={{ background: "var(--border)" }} />

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-[11px] font-body font-bold tracking-[0.1em] uppercase"
                                            style={{ color: world.color }}
                                        >
                                            {rank}
                                        </span>
                                        <span className="text-[12px] font-body text-muted-foreground/60">⟶</span>
                                        <span className="text-[10px] font-body font-semibold tracking-[0.1em] uppercase text-muted-foreground/60">
                                            {nextRank}
                                        </span>
                                    </div>
                                    <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                                        <div
                                            className="absolute inset-y-0 left-0 rounded-full"
                                            style={{
                                                width: `${tierProgress * 100}%`,
                                                background: `linear-gradient(90deg, ${world.color}, ${world.color}99)`,
                                                transition: "width 1600ms cubic-bezier(0.25,1,0.5,1) 200ms",
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-body">
                                        {Math.round(tierProgress * 100)}% through {rank} · {nextRequiedXp.toLocaleString()} XP for promotion
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ═════════════ RIGHT COLUMN — OPERATIONS ═════════════ */}
                    <main className="flex flex-col lg:col-span-7 xl:col-span-8 lg:gap-6">
                        {/* Desktop-only section heading */}
                        <div className="hidden lg:flex items-end justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                                    {world.display} · Daily Briefing
                                </span>
                                <h1 className="font-display font-bold text-[32px] leading-none tracking-[-0.03em] text-foreground">
                                    Welcome back, {USER_DATA.user.username}
                                </h1>
                            </div>
                        </div>

                        {/* ═══════ 3. TODAY'S MISSION ═══════ */}
                        <div className="px-4 mt-5 lg:px-0 lg:mt-0 lg:order-1">
                            <div
                                className="relative rounded-2xl lg:rounded-3xl overflow-hidden"
                                style={{
                                    background:
                                        "linear-gradient(180deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--card) 98%, transparent) 60%)",
                                    border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
                                    boxShadow: "0 0 0 1px color-mix(in srgb, var(--primary) 5%, transparent), inset 0 1px 0 rgba(255,255,255,0.03)",
                                }}
                            >
                                <div
                                    className="absolute top-0 left-1 right-1 h-[1.5px]"
                                    style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))", borderRadius: 9999 }}
                                />
                                {/* Desktop: content left, CTA block right */}
                                <div className="p-5 lg:p-8 lg:flex lg:items-end lg:justify-between lg:gap-10">
                                    <div className="lg:flex-1 lg:min-w-0">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-body font-bold tracking-[0.14em] uppercase text-primary">
                                                Today's Mission
                                            </span>
                                        </div>
                                        <h3 className="font-display font-bold text-[22px] lg:text-[40px] leading-tight lg:leading-none tracking-[-0.02em] lg:tracking-[-0.035em] text-foreground mb-1 lg:mb-2">
                                            Pull Day
                                        </h3>
                                        <p className="text-[12px] lg:text-[14px] text-muted-foreground font-body mb-4 lg:mb-5">
                                            3 sets · pull-ups, rows, curls — max reps
                                        </p>
                                        <div className="flex items-center gap-2 mb-5 lg:mb-0 flex-wrap">
                                            {[
                                                { icon: "⏱", label: "45 min" },
                                                { icon: "🔥", label: "Hard" },
                                                { icon: "⚡", label: "+620 XP" },
                                            ].map((m) => (
                                                <div
                                                    key={m.label}
                                                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
                                                    style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
                                                >
                                                    <span className="text-[12px]">{m.icon}</span>
                                                    <span className="text-[11px] font-body font-medium text-foreground/70">{m.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            router.replace("/skill-tree");
                                        }}
                                        className="w-full lg:w-[240px] lg:shrink-0 rounded-xl py-3.5 lg:py-4 font-display font-bold text-[15px] lg:text-[16px] tracking-[-0.01em] text-primary-foreground relative overflow-hidden active:scale-[0.98] transition-transform hover:cursor-pointer"
                                        style={{
                                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 55%, var(--accent) 140%)",
                                            boxShadow: "0 0 28px color-mix(in srgb, var(--primary) 45%, transparent), 0 4px 20px rgba(0,0,0,0.4)",
                                        }}
                                    >
                                        <div
                                            className="absolute inset-y-0 -left-full w-1/2"
                                            style={{
                                                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)",
                                                animation: "card-shimmer 3s ease-in-out infinite",
                                            }}
                                        />
                                        Begin Session →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ═══════ 4. RECENT ACTIVITY ═══════ */}
                        <div className="px-4 mt-5 lg:px-0 lg:mt-0 lg:order-3">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-display font-semibold text-[14px] lg:text-[16px] tracking-[-0.01em] text-foreground">
                                    Recent Activity
                                </span>
                                <button className="text-[11px] font-body text-muted-foreground hover:text-primary transition-colors">
                                    View all →
                                </button>
                            </div>
                            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                                {ACTIVITY.map((a, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3.5 lg:py-4 transition-colors hover:bg-secondary/40"
                                        style={{
                                            borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
                                            background:
                                                i % 2 === 0
                                                    ? "color-mix(in srgb, var(--card) 70%, transparent)"
                                                    : "color-mix(in srgb, var(--background) 50%, transparent)",
                                        }}
                                    >
                                        <div
                                            className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                                            style={{
                                                background: `color-mix(in srgb, ${a.color} 12%, transparent)`,
                                                border: `1px solid color-mix(in srgb, ${a.color} 25%, transparent)`,
                                            }}
                                        >
                                            {a.icon}
                                        </div>
                                        {/* Desktop: label and detail sit on one row */}
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4 gap-0.5 flex-1 min-w-0">
                                            <span className="font-body font-semibold text-[13px] lg:text-[14px] text-foreground leading-tight truncate lg:w-[220px] lg:shrink-0">
                                                {a.label}
                                            </span>
                                            <span className="font-body text-[11px] lg:text-[12px] text-muted-foreground truncate">{a.detail}</span>
                                        </div>
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6 items-end gap-0.5 shrink-0">
                                            <span className="font-body text-[10px] lg:text-[11px] text-muted-foreground/60 lg:order-1 order-2">{a.time}</span>
                                            <span className="font-display font-bold text-[12px] lg:text-[13px] lg:w-[72px] lg:text-right lg:order-2 order-1" style={{ color: a.color }}>
                                                {a.xp}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ═══════ 5. MINI STAT CARDS ═══════ */}
                        <div className="px-4 mt-4 lg:px-0 lg:mt-0 lg:order-2">
                            <div className="grid grid-cols-3 gap-2.5 lg:gap-4">
                                {MINI_STATS.map((s) => (
                                    <div
                                        key={s.label}
                                        className="rounded-2xl p-[18px] lg:p-5 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 relative overflow-hidden active:scale-[0.97] lg:hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                                        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                                    >
                                        <div
                                            className="w-8 h-8 lg:w-11 lg:h-11 rounded-[10px] lg:rounded-xl flex items-center justify-center text-base lg:text-xl shrink-0"
                                            style={{
                                                background: "color-mix(in srgb, var(--secondary) 80%, transparent)",
                                                border: "1px solid var(--border)",
                                            }}
                                        >
                                            {s.icon}
                                        </div>
                                        <div className="flex flex-col gap-2 lg:gap-1 min-w-0">
                                            <span className="hidden lg:block text-[10px] font-body font-semibold text-muted-foreground/60 tracking-[0.1em] uppercase">
                                                {s.label}
                                            </span>
                                            <div className="flex flex-col lg:flex-row lg:items-baseline lg:gap-1.5 gap-0.5">
                                                <span
                                                    className="font-display font-bold text-[18px] lg:text-[24px] leading-none tracking-[-0.02em]"
                                                    style={{ color: s.color }}
                                                >
                                                    {s.value}
                                                </span>
                                                <span className="text-[10px] lg:text-[11px] font-body text-muted-foreground leading-tight">
                                                    {s.sub}
                                                </span>
                                            </div>
                                            <span className="lg:hidden text-[10px] font-body font-semibold text-muted-foreground/60 tracking-[0.1em] uppercase">
                                                {s.label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ═══════ 6. RIVAL CHALLENGE CTA ═══════ */}
                        <div className="px-4 mt-4 pb-8 lg:px-0 lg:mt-0 lg:pb-0 lg:order-4">
                            <button
                                className="w-full rounded-2xl px-4 lg:px-5 py-3.5 lg:py-4 flex items-center justify-between transition-all duration-200 hover:border-primary/30 active:scale-[0.98]"
                                style={{
                                    background: "color-mix(in srgb, var(--card) 70%, transparent)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <div className="flex items-center gap-3 lg:gap-4">
                                    <div
                                        className="w-9 h-9 lg:w-10 lg:h-10 rounded-[10px] flex items-center justify-center text-lg"
                                        style={{
                                            background: "color-mix(in srgb, var(--gold) 10%, transparent)",
                                            border: "1px solid color-mix(in srgb, var(--gold) 20%, transparent)",
                                        }}
                                    >
                                        ⚔️
                                    </div>
                                    <div className="flex flex-col gap-0.5 text-left">
                                        <span className="font-body font-semibold text-[13px] lg:text-[14px] text-foreground">
                                            Rival Challenge Waiting
                                        </span>
                                        <span className="font-body text-[11px] lg:text-[12px] text-muted-foreground">
                                            @apex_k is challenging you · Expires 11h
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="hidden lg:inline text-[12px] font-body font-semibold text-primary">Accept</span>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 3l5 5-5 5" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </main>
                </div>
            ) : (
                <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground font-body">
                    Loading...
                </div>
            )}
        </>
    );
}
