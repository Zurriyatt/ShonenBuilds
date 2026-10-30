
"use client";

import {
    getRankName,
    getTierFromLevel,
    getLevelFromXp,
    getWorld,
} from "@/lib/world/MPS";

export default function Leaderboard() {
    const MOCK_LEADERBOARD = [
        { userId: "u1", name: "Ryuken", xp: 62700, power: 8500, streak: 45, world: "hunter", path: "hunter" },
        { userId: "u2", name: "IronKai", xp: 48200, power: 7200, streak: 12, world: "shinobi", path: "shinobi" },
        { userId: "u3", name: "Sora_V", xp: 41900, power: 6100, streak: 30, world: "pirate", path: "pirate" },
        { userId: "u4", name: "Akira_Z", xp: 38400, power: 5500, streak: 8, world: "soul", path: "reaper" },
        { userId: "u5", name: "Vanta", xp: 35100, power: 4900, streak: 21, world: "demon", path: "demon" },
        { userId: "u6", name: "zuri_pirate", xp: 31800, power: 3895, streak: 1, world: "pirate", path: "pirate" },
        { userId: "u7", name: "Kenji", xp: 29500, power: 3400, streak: 14, world: "shinobi", path: "ancient" },
        { userId: "u8", name: "Nova", xp: 27000, power: 3100, streak: 5, world: "game", path: "ranked" },
        { userId: "u9", name: "Tensa", xp: 24500, power: 2800, streak: 33, world: "soul", path: "lifebringer" },
        { userId: "u10", name: "Goku_Black", xp: 21000, power: 2400, streak: 2, world: "multiverse", path: "human" },
        { userId: "u11", name: "Levi", xp: 18500, power: 2100, streak: 60, world: "shinobi", path: "shinobi" },
        { userId: "u12", name: "Luffy", xp: 16200, power: 1800, streak: 18, world: "pirate", path: "navy" },
        { userId: "u13", name: "Sukuna", xp: 14000, power: 1500, streak: 0, world: "demon", path: "royal" },
        { userId: "u14", name: "Gojo", xp: 11500, power: 1200, streak: 9, world: "hunter", path: "monarch" },
        { userId: "u15", name: "Ichigo", xp: 9000, power: 1000, streak: 4, world: "soul", path: "reaper" },
    ];

    const getRankData = (user: any) => {
        const level = getLevelFromXp(user.xp);
        const tier = getTierFromLevel(level);
        const rank = getRankName(user.world, user.path, tier);
        const worldData = getWorld(user.world);

        return { level, tier, rank, worldData };
    };

    const top1 = MOCK_LEADERBOARD[0];
    const top2 = MOCK_LEADERBOARD[1];
    const top3 = MOCK_LEADERBOARD[2];
    const rest = MOCK_LEADERBOARD.slice(3);

    const currentUserRank =
        MOCK_LEADERBOARD.findIndex((user) => user.name === "zuri_pirate") + 1;

    const formatNumber = (value: number) => value.toLocaleString();

    const PODIUM_STYLES: Record<number, {
        accent: string;
        border: string;
        glow: string;
        platform: string;
        text: string;
    }> = {
        1: {
            accent: "#F5A41E",
            border: "border-[#F5A41E]/60",
            glow: "shadow-[0_0_35px_rgba(245,164,30,0.14)]",
            platform: "from-[#F5A41E]/25 via-[#F5A41E]/5 to-transparent",
            text: "text-[#F5A41E]",
        },
        2: {
            accent: "#AEB7C4",
            border: "border-[#AEB7C4]/50",
            glow: "shadow-[0_0_25px_rgba(174,183,196,0.08)]",
            platform: "from-[#AEB7C4]/20 via-[#AEB7C4]/5 to-transparent",
            text: "text-[#AEB7C4]",
        },
        3: {
            accent: "#CD7F32",
            border: "border-[#CD7F32]/50",
            glow: "shadow-[0_0_25px_rgba(205,127,50,0.08)]",
            platform: "from-[#CD7F32]/20 via-[#CD7F32]/5 to-transparent",
            text: "text-[#CD7F32]",
        },
    };

    const PodiumCard = ({
        user,
        place,
    }: {
        user: typeof MOCK_LEADERBOARD[number];
        place: 1 | 2 | 3;
    }) => {
        const { rank, tier, worldData } = getRankData(user);
        const style = PODIUM_STYLES[place];
        const isFirst = place === 1;

        return (
            <div className={`relative flex flex-col items-center min-w-0 flex-1 max-w-[190px] ${
                isFirst ? "z-10" : "z-0"
            }`}>
                {/* Decorative glow */}
                <div
                    className="absolute -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: style.accent }}
                />

                {/* Player information */}
                <div className="relative flex flex-col items-center w-full mb-4">
                    <div
                        className={`relative flex items-center justify-center rounded-full mb-3 border ${
                            isFirst ? "w-14 h-14" : "w-11 h-11"
                        }`}
                        style={{
                            borderColor: `${style.accent}80`,
                            background: `linear-gradient(145deg, ${style.accent}25, var(--card))`,
                            boxShadow: isFirst
                                ? `0 0 24px ${style.accent}25`
                                : "none",
                        }}
                    >
                        <span
                            className={`font-display font-bold ${
                                isFirst ? "text-xl" : "text-lg"
                            }`}
                            style={{ color: style.accent }}
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </span>

                        <span
                            className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border-2 border-background"
                            style={{
                                backgroundColor: style.accent,
                                color: "#09080F",
                            }}
                        >
                            {place}
                        </span>
                    </div>

                    <span
                        className={`font-display font-bold text-center truncate w-full ${
                            isFirst ? "text-base sm:text-lg" : "text-sm sm:text-base"
                        }`}
                        style={{ color: isFirst ? style.accent : "var(--foreground)" }}
                    >
                        {user.name}
                    </span>

                    <span
                        className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-center truncate w-full mt-1"
                        style={{ color: worldData?.color || "var(--muted-foreground)" }}
                    >
                        {rank} · T{tier}
                    </span>
                </div>

                {/* Podium platform */}
                <div
                    className={`relative w-full overflow-hidden rounded-t-xl border-t ${style.border} ${style.glow} ${
                        isFirst ? "h-40 sm:h-48" : place === 2
                            ? "h-32 sm:h-36"
                            : "h-24 sm:h-28"
                    }`}
                    style={{
                        background: `linear-gradient(to bottom, ${style.accent}12, var(--card))`,
                    }}
                >
                    <div className={`absolute inset-0 bg-gradient-to-b ${style.platform}`} />

                    <div className="absolute inset-x-0 top-0 h-px"
                        style={{ backgroundColor: style.accent }}
                    />

                    <div className="relative flex flex-col items-center justify-center h-full px-1">
                        <span
                            className={`font-display font-bold ${
                                isFirst ? "text-5xl sm:text-6xl" : "text-4xl"
                            }`}
                            style={{
                                color: style.accent,
                                textShadow: `0 0 24px ${style.accent}35`,
                            }}
                        >
                            {isFirst ? "♛" : `#${place}`}
                        </span>

                        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-muted-foreground mt-2">
                            {isFirst ? "Champion" : place === 2 ? "Runner up" : "Third place"}
                        </span>

                        <div className="mt-4 flex flex-col items-center gap-1">
                            <span className="font-display font-bold text-sm sm:text-base text-foreground">
                                {formatNumber(user.xp)}
                            </span>
                            <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                                Total XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats footer */}
                <div className="w-full flex items-center justify-center gap-3 sm:gap-5 py-3 px-1 bg-secondary/40 border border-border/40 border-t-0 rounded-b-xl">
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-accent">
                            {formatNumber(user.power)}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                            Power
                        </span>
                    </div>

                    <div className="w-px h-6 bg-border/70" />

                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-orange-400">
                            {user.streak}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                            Streak
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="relative flex flex-col max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-24 w-full overflow-hidden">

            {/* Ambient background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gold/[0.035] blur-[120px] rounded-full pointer-events-none" />

            {/* ═════════════ HEADER ═════════════ */}
            <header className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-9 sm:mb-12">

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 shadow-[0_0_25px_rgba(245,164,30,0.08)]">
                        <span className="text-2xl">♛</span>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold">
                                Competitive Rankings
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gold/60" />
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                Global
                            </span>
                        </div>

                        <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
                            Leaderboard
                        </h1>

                        <p className="text-xs text-muted-foreground mt-1">
                            Rise through the ranks. Prove your power.
                        </p>
                    </div>
                </div>

                <button className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gold/30 text-gold text-xs font-bold tracking-wider uppercase bg-gold/[0.07] shadow-[0_0_20px_rgba(245,164,30,0.08)] transition-all hover:bg-gold/15 hover:border-gold/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(245,164,30,0.9)]" />
                    Global Rankings
                    <span className="text-gold/50">⌄</span>
                </button>
            </header>

            {/* ═════════════ QUICK OVERVIEW ═════════════ */}
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">

                <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        Competitors
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-display font-bold text-foreground">
                            {MOCK_LEADERBOARD.length}
                        </span>
                        <span className="text-[10px] text-muted-foreground mb-1">
                            Players ranked
                        </span>
                    </div>
                </div>

                <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        Your Position
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-display font-bold text-primary">
                            #{currentUserRank || "—"}
                        </span>
                        <span className="text-[10px] text-muted-foreground mb-1">
                            Global rank
                        </span>
                    </div>
                </div>

                <div className="hidden sm:block rounded-xl border border-gold/20 bg-gold/[0.05] p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        Current Champion
                    </p>
                    <div className="flex items-end gap-2 min-w-0">
                        <span className="text-lg font-display font-bold text-gold truncate">
                            {top1.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground mb-1">
                            #{1}
                        </span>
                    </div>
                </div>
            </section>

            {/* ═════════════ TOP THREE PODIUM ═════════════ */}
            <section className="relative mb-12 sm:mb-16">

                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h2 className="font-display font-bold text-lg text-foreground">
                            Hall of Fame
                        </h2>
                        <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">
                            THE THREE STRONGEST PLAYERS
                        </p>
                    </div>

                    <span className="text-[9px] uppercase tracking-[0.2em] text-gold/70 font-bold border border-gold/20 bg-gold/5 rounded-lg px-3 py-2">
                        Top 3
                    </span>
                </div>

                <div className="relative rounded-2xl border border-border/50 bg-card/40 px-2 sm:px-6 pt-7 sm:pt-9 pb-0 overflow-hidden">

                    {/* Podium background lighting */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-gold/[0.06] blur-[80px] pointer-events-none" />

                    <div className="relative flex items-end justify-center gap-2 sm:gap-6">
                        <PodiumCard user={top2} place={2} />
                        <PodiumCard user={top1} place={1} />
                        <PodiumCard user={top3} place={3} />
                    </div>
                </div>
            </section>

            {/* ═════════════ PLAYER RANKINGS ═════════════ */}
            <section>

                <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                        <h2 className="font-display font-bold text-lg text-foreground">
                            Global Rankings
                        </h2>
                        <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">
                            PLAYER PERFORMANCE & PROGRESSION
                        </p>
                    </div>

                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary/70 px-3 py-2 rounded-lg border border-border/50">
                        RANK #4–#{MOCK_LEADERBOARD.length}
                    </span>
                </div>

                {/* Column labels */}
                <div className="hidden sm:flex items-center justify-between px-5 mb-2">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        Player
                    </span>

                    <div className="flex items-center gap-8 pr-1">
                        <span className="w-20 text-right text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                            XP
                        </span>
                        <span className="w-20 text-right text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                            Power
                        </span>
                        <span className="w-16 text-right text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                            Streak
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {rest.map((user, i) => {
                        const actualRank = i + 4;
                        const { tier, rank, worldData } = getRankData(user);
                        const isMe = user.name === "zuri_pirate";

                        return (
                            <div
                                key={user.userId}
                                className={`group relative flex items-center justify-between gap-2 sm:gap-4 px-3 py-3.5 sm:px-5 sm:py-4 rounded-xl border transition-all duration-200 overflow-hidden ${
                                    isMe
                                        ? "border-primary/40 bg-primary/[0.07] shadow-[0_0_22px_rgba(138,92,245,0.08)]"
                                        : "border-border/50 bg-card/70 hover:bg-secondary/50 hover:border-border"
                                }`}
                            >
                                {/* Current user accent */}
                                {isMe && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary shadow-[0_0_12px_rgba(138,92,245,0.8)]" />
                                )}

                                {/* Left side */}
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">

                                    <span className={`w-6 sm:w-7 text-right font-mono text-xs shrink-0 ${
                                        isMe ? "text-primary font-bold" : "text-muted-foreground"
                                    }`}>
                                        #{actualRank}
                                    </span>

                                    <div className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 border ${
                                        isMe
                                            ? "bg-primary/15 border-primary/30"
                                            : "bg-secondary border-border/50"
                                    }`}>
                                        <span className={`font-display font-bold text-sm ${
                                            isMe ? "text-primary" : "text-foreground/80"
                                        }`}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>

                                        {user.streak > 0 && (
                                            <span className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-card border border-border text-[8px]">
                                                🔥
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col min-w-0 gap-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`font-display font-bold text-[13px] sm:text-sm truncate ${
                                                isMe ? "text-primary" : "text-foreground"
                                            }`}>
                                                {user.name}
                                            </span>

                                            {isMe && (
                                                <span className="text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 shrink-0">
                                                    YOU
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="text-[9px] uppercase font-bold tracking-wide truncate"
                                                style={{
                                                    color: worldData?.color || "var(--muted-foreground)",
                                                }}
                                            >
                                                {rank}
                                            </span>
                                            <span className="text-[8px] text-muted-foreground">•</span>
                                            <span className="text-[9px] text-muted-foreground font-semibold">
                                                T{tier}
                                            </span>
                                        </div>

                                        {/* World badge */}
                                        <span
                                            className="hidden lg:inline-flex w-fit text-[8px] font-bold tracking-widest uppercase px-2 py-1 rounded-md border mt-0.5"
                                            style={{
                                                color: worldData?.color || "var(--foreground)",
                                                backgroundColor: worldData?.glow || "transparent",
                                                borderColor: worldData?.border || "var(--border)",
                                            }}
                                        >
                                            {user.world}
                                        </span>
                                    </div>
                                </div>

                                {/* Right side stats */}
                                <div className="flex items-center gap-3 sm:gap-7 shrink-0">

                                    <div className="flex flex-col items-end min-w-[43px] sm:w-20">
                                        <span className="font-display font-bold text-[13px] sm:text-sm text-gold tabular-nums">
                                            {formatNumber(user.xp)}
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                                            XP
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-end min-w-[38px] sm:w-20">
                                        <span className="font-display font-bold text-[13px] sm:text-sm text-accent tabular-nums">
                                            {formatNumber(user.power)}
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                                            Power
                                        </span>
                                    </div>

                                    <div className="hidden sm:flex flex-col items-end w-16">
                                        <span className="font-display font-bold text-sm text-orange-400 tabular-nums">
                                            {user.streak}
                                        </span>
                                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                                            Streak
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ═════════════ FOOTER ═════════════ */}
            <div className="flex items-center justify-center gap-3 mt-8 py-5 border-t border-border/40">
                <div className="w-8 h-px bg-gradient-to-r from-transparent to-border" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                    Keep grinding. Your next rank awaits.
                </span>
                <div className="w-8 h-px bg-gradient-to-l from-transparent to-border" />
            </div>
            <p className=" fixed bottom-5 left-5 text-muted-foreground font-display text-sm z-28">Daily Reset time: UTC+0 at 12 AM</p>
        </main>
    );
}
