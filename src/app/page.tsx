    "use client";

    import { useState, useEffect } from "react";

    function ExpBar() {
        const [filled, setFilled] = useState(false);

        useEffect(() => {
            const t = setTimeout(() => setFilled(true), 800);
            return () => clearTimeout(t);
        }, []);

        return (
            <div className="w-full max-w-4xl mx-auto px-8">
                <div className="flex items-center gap-4 mb-2">
                    <span className="font-body text-xs text-muted-foreground tracking-widest">LVL 7</span>

                    <div className="flex-1 relative overflow-hidden h-2 rounded-full bg-border">
                        <div
                            className="absolute inset-0 rounded-full bg-linear-to-r from-primary to-accent shadow-[0_0_12px_rgba(138,92,245,0.6),0_0_24px_rgba(3,228,255,0.3)] transition-[width] duration-2200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                            style={{ width: filled ? "72%" : "0%" }}
                        >
                            <div
                                className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-white/25 to-transparent"
                                style={{
                                    animation: filled ? "glow-slide 2s ease 2.4s both" : "none",
                                }}
                            />
                        </div>
                    </div>

                    <span className="font-body text-xs text-muted-foreground tracking-widest">LVL 8</span>

                    <span className="font-body text-[11px] text-primary bg-primary/15 rounded-full px-2.5 py-0.5 tracking-wide">
                        72% XP
                    </span>
                </div>
            </div>
        );
    }

    /* =========================================================
    PREVIEW CARDS DATA
    ========================================================= */
    const PREVIEW_CARDS = [
        {
            label: "Training Log",
            tag: "Live Stats",
            tagColor: "text-accent",
            tagBg: "bg-accent/10",
            tagBorder: "border-accent/25",
            content: (
                <div className="flex flex-col gap-3 p-1">
                    <div className="flex gap-2">
                        {[
                            { label: "XP Today", val: "+340", color: "text-primary" },
                            { label: "Streak", val: "9d 🔥", color: "text-gold" },
                            { label: "Skills", val: "3 done", color: "text-accent" },
                        ].map((s) => (
                            <div key={s.label} className="flex-1 flex flex-col gap-1 rounded-lg p-2 bg-secondary">
                                <span className="text-[10px] text-muted-foreground font-body">{s.label}</span>
                                <span className={`text-[15px] font-bold font-display ${s.color}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-secondary rounded-lg px-2.5 py-2">
                        <div className="text-[10px] text-muted-foreground mb-1.5">Recent Activity</div>
                        {[
                            { text: "Muscle-Up — first clean rep", xp: "+120 XP", t: "14m ago" },
                            { text: "Handstand Hold — 30s", xp: "+80 XP", t: "2h ago" },
                            { text: "L-Sit progression unlocked", xp: "+50 XP", t: "5h ago" },
                        ].map((a, i) => (
                            <div
                                key={i}
                                className={`flex justify-between items-center py-[3px] ${
                                    i < 2 ? "border-b border-border" : ""
                                }`}
                            >
                                <span className="text-[10px] text-white/60 font-body">{a.text}</span>
                                <div className="flex gap-2">
                                    <span className="text-[10px] text-primary font-semibold">{a.xp}</span>
                                    <span className="text-[10px] text-muted-foreground">{a.t}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            label: "Skill Tree",
            tag: "Calisthenics",
            tagColor: "text-primary",
            tagBg: "bg-primary/10",
            tagBorder: "border-primary/25",
            content: (
                <div className="flex flex-col gap-2 p-1">
                    <div className="flex justify-center items-center relative h-[110px]">
                        {/* Center node */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(138,92,245,0.7)] z-[2]">
                            <span className="text-sm">💪</span>
                        </div>

                        {/* Satellite nodes */}
                        {[
                            { label: "Pull-Up", top: 1, left: "48%", ml: -12, unlocked: true },
                            { label: "Dip", top: 38, left: "27%", unlocked: true },
                            { label: "HSPU", top: 38, left: "63%", unlocked: true },
                            { label: "Planche", top: 75, left: "35%", unlocked: false },
                            { label: "Front L", top: 75, left: "55%", unlocked: false },
                        ].map((n) => (
                            <div
                                key={n.label}
                                className={`absolute w-8 h-7 rounded-md flex items-center justify-center text-[7px] font-body font-semibold ${
                                    n.unlocked
                                        ? "bg-primary/15 border border-primary text-white"
                                        : "bg-border/50 border border-border text-muted-foreground"
                                }`}
                                style={{ top: n.top, left: n.left, marginLeft: n.ml }}
                            >
                                {n.label}
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg bg-secondary px-2.5 py-1.5 flex justify-between items-center">
                        <span className="text-[10px] text-white/70 font-body">Upper Body Mastery Path</span>
                        <span className="text-[10px] text-primary font-bold">3/5 unlocked</span>
                    </div>
                </div>
            ),
        },
        {
            label: "Leaderboard",
            tag: "Global",
            tagColor: "text-gold",
            tagBg: "bg-gold/10",
            tagBorder: "border-gold/25",
            content: (
                <div className="flex flex-col gap-1 p-1">
                    {/* Podium */}
                    <div className="flex justify-center items-end gap-2 mb-2 min-h-14">
                        {[
                            {
                                rank: 2,
                                name: "IronKai",
                                xp: "48.2K",
                                height: 36,
                                color: "#9BA3AE",
                                rank_title: "S-Rank Hunter",
                            },
                            {
                                rank: 1,
                                name: "Ryuken",
                                xp: "62.7K",
                                height: 52,
                                color: "#F5A41E",
                                rank_title: "Kage Level",
                            },
                            {
                                rank: 3,
                                name: "Sora_V",
                                xp: "41.9K",
                                height: 28,
                                color: "#CD7F32",
                                rank_title: "Vice-Captain",
                            },
                        ].map((p) => (
                            <div key={p.rank} className="flex flex-col items-center gap-1">
                                <span className="text-[8px] font-bold font-display" style={{ color: p.color }}>
                                    {p.name}
                                </span>
                                <span className="text-[7px] text-muted-foreground font-body">{p.rank_title}</span>
                                <div
                                    className={`w-8 rounded-t flex items-center justify-center text-xs ${
                                        p.rank === 1
                                            ? "bg-gradient-to-b from-gold to-gold/20 shadow-[0_0_16px_rgba(245,164,30,0.4)]"
                                            : "bg-secondary"
                                    }`}
                                    style={{
                                        height: p.height,
                                        border: `1px solid ${p.color}`,
                                    }}
                                >
                                    {p.rank === 1 ? "👑" : `#${p.rank}`}
                                </div>
                            </div>
                        ))}
                    </div>

                    {[
                        { rank: 4, name: "Akira_Z", xp: "38.4K", change: "+2", rank_title: "Yonko (T8)", self: false },
                        { rank: 5, name: "Vanta", xp: "35.1K", change: "-1", rank_title: "Diamond (T5)", self: false },
                        { rank: 6, name: "You", xp: "31.8K", change: "+5", rank_title: "Chunin (T3)", self: true },
                    ].map((r) => (
                        <div
                            key={r.rank}
                            className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                                r.self ? "bg-primary/10 border border-primary/30" : "border border-transparent"
                            }`}
                        >
                            <span className="w-3.5 text-[10px] text-muted-foreground font-body">#{r.rank}</span>
                            <div className="w-4 h-4 rounded-full bg-secondary border border-border text-[9px] flex items-center justify-center">
                                {r.self ? "🙂" : r.name[0]}
                            </div>
                            <span
                                className={`flex-1 text-[10px] font-body ${
                                    r.self ? "text-white font-semibold" : "text-white/60"
                                }`}
                            >
                                {r.name}
                            </span>
                            <span className="text-[8px] text-gold bg-gold/10 border border-gold/25 rounded px-1.5 py-px font-body">
                                {r.rank_title}
                            </span>
                            <span className="text-[10px] text-primary font-body">{r.xp}</span>
                            <span className={`text-[9px] ${r.change.startsWith("+") ? "text-accent" : "text-red-400"}`}>
                                {r.change}
                            </span>
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    /* =========================================================
    PAGE
    ========================================================= */
    export default function Home() {
        return (
            <div className="min-h-screen max-w-screen ybg-background font-body overflow-x-hidden">
                {/* ============ HERO ============ */}
                <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6  pb-20 overflow-hidden">
                    {/* Violet orb */}
                    <div className="animate-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[640px] h-[640px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(138,92,245,0.28)_0%,rgba(138,92,245,0.08)_45%,transparent_70%)] pointer-events-none z-0" />
                    {/* Cyan orb */}
                    <div className="absolute top-[55%] left-[52%] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(3,228,255,0.06)_0%,transparent_65%)] pointer-events-none z-0" />

                    {/* Badge chip */}
                    <div className="fade-up-1 inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-full px-3.5 py-1.5 mb-8 z-[1]">
                        <span className="text-[11px] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold tracking-[0.08em] uppercase">
                            Now in Beta
                        </span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] text-muted-foreground">Join 8,400+ warriors</span>
                    </div>

                    {/* Headline */}
                    <h1 className="fade-up-2 font-display font-bold text-[clamp(56px,8vw,96px)] leading-none tracking-[-0.04em] text-white mb-6 z-[1] max-w-[800px]">
                        Level Up.{" "}
                        <span className="bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
                            Every Day.
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="fade-up-3 font-body font-light text-[clamp(16px,2vw,20px)] text-white/55 max-w-[520px] text-xs leading-[1.65] mb-10 z-1">
                        Master calisthenics. Choose your discipline — build bodyweight
                        control as a Shinobi, unlock explosive S-Rank strength as an Awakened Hunter, forge unbreakable core
                        endurance on the High Seas, or develop pure mind-muscle mastery as a Spirit Warrior. Every rep earns
                        XP. Break your limits and climb 10 tiers of power.
                    </p>

                    {/* CTAs */}
                    <div className="fade-up-4 flex gap-3 z-[1] flex-wrap justify-center">
                        <button className="bg-primary text-white border-none rounded-[10px] px-7 py-3.5 text-[15px] font-semibold font-body cursor-pointer tracking-[-0.01em] shadow-[0_0_24px_rgba(138,92,245,0.45),0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#9B6FF7] hover:shadow-[0_0_36px_rgba(138,92,245,0.65),0_6px_24px_rgba(0,0,0,0.4)]">
                            Get Started Free
                        </button>
                        <button className="bg-transparent text-white/75 border border-border rounded-[10px] px-7 py-3.5 text-[15px] font-medium font-body cursor-pointer tracking-[-0.01em] transition-all duration-150 hover:border-primary/50 hover:text-white hover:-translate-y-0.5">
                            ▶ See How It Works
                        </button>
                    </div>

                    {/* Social proof */}
                    <div className="fade-up-4 mt-10 z-[1] flex items-center gap-3">
                        <div className="flex">
                            {["#8A5CF5", "#7C4DEA", "#6B3DD8", "#5A2DC6"].map((c, i) => (
                                <div
                                    key={i}
                                    className="w-7 h-7 rounded-full border-2 border-background text-[11px] flex items-center justify-center"
                                    style={{ background: c, marginLeft: i > 0 ? -8 : 0 }}
                                >
                                    {["😎", "🔥", "⚡", "🎯"][i]}
                                </div>
                            ))}
                        </div>
                        <span className="text-[13px] text-muted-foreground">
                            <strong className="text-white">8,421</strong> warriors training right now
                        </span>
                    </div>
                </section>

                {/* ============ EXP BAR DIVIDER ============ */}
                <div className="fade-up-5 pb-12 flex flex-col items-center gap-2">
                    <span className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase font-body">
                        E-Rank → S-Rank → SSS-Rank → EX-Rank → Apex · Your universe. Your rank.
                    </span>
                    <ExpBar />
                    <span className="text-[11px] text-muted-foreground font-body">
                        Complete your first skill node to earn XP and start climbing
                    </span>
                </div>

                {/* ============ FEATURE CARDS ============ */}
                <section className="px-12 pb-24 max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {PREVIEW_CARDS.map((card, i) => (
                            <div
                                key={card.label}
                                className={`fade-up-${i + 3} bg-card border border-border rounded-2xl overflow-hidden transition-all duration-[250ms] cursor-default hover:border-primary/40 hover:shadow-[0_0_40px_rgba(138,92,245,0.12)] hover:-translate-y-1`}
                            >
                                {/* Card header */}
                                <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
                                                <div
                                                    key={c}
                                                    className="w-2 h-2 rounded-full opacity-70"
                                                    style={{ background: c }}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-display font-bold text-[13px] text-white/85 tracking-[-0.01em]">
                                            {card.label}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-[10px] font-body font-semibold tracking-[0.04em] rounded-full px-2 py-0.5 ${card.tagColor} ${card.tagBg} ${card.tagBorder} border`}
                                    >
                                        {card.tag}
                                    </span>
                                </div>

                                {/* Card body */}
                                <div className="px-3.5 pt-3 pb-4">{card.content}</div>
                            </div>
                        ))}
                    </div>

                    {/* Below cards */}
                    <div className="text-center mt-10">
                        <p className="text-sm text-muted-foreground font-body">
                            Train. Unlock nodes. Rank up. Challenge squads. The grind has never felt this real.
                        </p>
                        <a
                            href="/skill-paths"
                            className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-body font-medium no-underline transition-[gap] duration-200 hover:gap-2.5"
                        >
                            View all skill paths <span>→</span>
                        </a>
                    </div>
                </section>

                {/* ============ FOOTER ============ */}
                <footer className="border-t border-border px-12 py-8 flex items-center justify-between max-w-[1200px] mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[7px] bg-gradient-to-br from-secondary to-card border border-[rgba(255,107,26,0.4)] flex items-center justify-center">
                            <svg width="10" height="12" viewBox="0 0 16 18" fill="none">
                                <path
                                    d="M13 5.5C13 4 11.5 3 9 3C6.5 3 4.5 4.2 4.5 6C4.5 7.8 6.5 8.5 8.5 9C10.5 9.5 13 10.5 13 12.5C13 14.5 11 15.5 8.5 15.5C6 15.5 3.5 14.2 3 12.5"
                                    stroke="url(#sgrad2)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient
                                        id="sgrad2"
                                        x1="3"
                                        y1="3"
                                        x2="13"
                                        y2="15"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#FF6B1A" />
                                        <stop offset="1" stopColor="#F5A41E" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className="font-display font-bold text-[13px] text-white/40">ShonenBuilds</span>
                    </div>

                    <div className="flex gap-6">
                        {["Privacy", "Terms", "Status", "Contact"].map((l) => (
                            <a
                                key={l}
                                href="#"
                                className="text-xs text-muted-foreground font-body no-underline transition-colors duration-200 hover:text-white"
                            >
                                {l}
                            </a>
                        ))}
                    </div>

                    <span className="text-xs text-muted-foreground font-body">© 2026 ShonenBuilds</span>
                </footer>
            </div>
        );
    }
