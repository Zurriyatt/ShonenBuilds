"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@/lib/auth/verify";
import { useUser } from "@/lib/auth/UserProvider";
/* =========================================================
   NAV ITEMS
   ========================================================= */
const NAV_ITEMS = [
    { icon: "🌳", label: "Skill Tree", href: "/skill-tree" },
    { icon: "⚔️", label: "Ranks", href: "/ranks" },
    { icon: "🏆", label: "Leaderboard", href: "/leaderboard" },
    { icon: "👥", label: "Squad", href: "/squads" },
    { icon: "⚙️", label: "Sanctum", href: "/sanctum" },
];

const WORLDS = [
    { id: "shinobi", icon: "🥷", title: "Shinobi World", color: "#03E4FF", glow: "rgba(3,228,255,0.22)" },
    { id: "hunter", icon: "⚡", title: "Hunter World", color: "#8A5CF5", glow: "rgba(138,92,245,0.25)" },
    { id: "pirate", icon: "⚓", title: "Pirate World", color: "#38BDF8", glow: "rgba(56,189,248,0.2)" },
    { id: "soul", icon: "🌀", title: "Soul World", color: "#F5A41E", glow: "rgba(245,164,30,0.2)" },
    { id: "demon", icon: "🔥", title: "Demon World", color: "#F87171", glow: "rgba(248,113,113,0.2)" },
    { id: "game", icon: "🎮", title: "Game World", color: "#10B981", glow: "rgba(16,185,129,0.2)" },
    { id: "multiverse", icon: "✦", title: "Multiverse", color: "#C084FC", glow: "rgba(192,132,252,0.2)" },
];

/* =========================================================
   LOGO MARK (shared visual)
   ========================================================= */
function LogoMark({ size = 28 }: { size?: number }) {
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <div
                className="absolute rounded-[10px] opacity-40"
                style={{
                    inset: -2,
                    background: "linear-gradient(135deg, #FF6B1A, #F5A41E)",
                    filter: "blur(5px)",
                }}
            />
            <div
                className="relative w-full h-full rounded-[10px] flex items-center justify-center"
                style={{
                    background: "linear-gradient(145deg, #1B1A26 0%, #0F0E1A 100%)",
                    border: "1px solid rgba(255,107,26,0.6)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
            >
                <svg width={size * 0.47} height={size * 0.53} viewBox="0 0 16 18" fill="none">
                    <path
                        d="M13 5.5C13 4 11.5 3 9 3C6.5 3 4.5 4.2 4.5 6C4.5 7.8 6.5 8.5 8.5 9C10.5 9.5 13 10.5 13 12.5C13 14.5 11 15.5 8.5 15.5C6 15.5 3.5 14.2 3 12.5"
                        stroke="url(#lm-sb)"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="lm-sb" x1="3" y1="3" x2="13" y2="15" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FF6B1A" />
                            <stop offset="1" stopColor="#F5A41E" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}

/* =========================================================
   NAV ITEM
   ========================================================= */
function NavItem({
    item,
    active,
    index,
    visible,
    onNavigate,
}: {
    item: (typeof NAV_ITEMS)[number];
    active: boolean;
    index: number;
    visible: boolean;
    onNavigate: () => void;
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="flex items-center gap-3 rounded-xl px-3 transition-all duration-200 relative select-none"
            style={{
                minHeight: 48,
                background: active ? "color-mix(in srgb, var(--primary) 10%, transparent)" : hovered ? "var(--secondary)" : "transparent",
                boxShadow: active ? "inset 3px 0 0 var(--primary)" : "none",
                animation: visible
                    ? `fade-up 0.4s cubic-bezier(0.22,1,0.36,1) ${100 + index * 40}ms both`
                    : "none",
            }}
        >
            <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[16px] shrink-0 transition-all duration-200"
                style={{
                    background: active
                        ? "color-mix(in srgb, var(--primary) 18%, transparent)"
                        : hovered
                          ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                          : "color-mix(in srgb, var(--secondary) 60%, transparent)",
                    border: `1px solid ${active ? "color-mix(in srgb, var(--primary) 40%, transparent)" : "var(--border)"}`,
                    boxShadow: active ? "0 0 10px color-mix(in srgb, var(--primary) 25%, transparent)" : "none",
                }}
            >
                {item.icon}
            </div>
            <span
                className="font-body font-medium text-[14px] transition-colors duration-200"
                style={{
                    color: active ? "var(--primary)" : hovered ? "var(--foreground)" : "var(--muted-foreground)",
                }}
            >
                {item.label}
            </span>
        </Link>
    );
}

/* =========================================================
   SIDEBAR
   ========================================================= */
export function SideBar({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const [xpFilled, setXpFilled] = useState(false);
    const USER_DATA = useUser().user;
    // Trigger XP bar fill 300ms after opening
    useEffect(() => {
        if (visible) {
            const t = setTimeout(() => setXpFilled(true), 320);
            return () => clearTimeout(t);
        } else {
            setXpFilled(false);
        }
    }, [visible]);

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && visible) onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [visible, onClose]);

    // Lock body scroll when open
    useEffect(() => {
        if (visible) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [visible]);

    const world = USER_DATA
        ? WORLDS.find((w) => w.id === USER_DATA.world) ?? WORLDS[1]
        : WORLDS[1];

    const loggedIn = USER_DATA?true:false;

    return (
        <>
            {/* ── BACKDROP ── */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-50 transition-opacity duration-300 "
                style={{
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(3px)",
                    opacity: visible ? 1 : 0,
                    pointerEvents: visible ? "auto" : "none",
                }}
            />

            {/* ── DRAWER PANEL ── */}
            <aside
                className="fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden "
                style={{
                    width: 300,
                    background: "color-mix(in srgb, var(--card) 97%, transparent)",
                    backdropFilter: "blur(28px)",
                    borderRight: "1px solid var(--border)",
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                    boxShadow: `0 0 0 1px color-mix(in srgb, var(--primary) 7%, transparent), 0 24px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04), 6px 0 48px color-mix(in srgb, var(--primary) 10%, transparent)`,
                    transform: visible ? "translateX(0)" : "translateX(-320px)",
                    transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Grain */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.022] z-[1]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                        backgroundSize: "120px",
                    }}
                />

                {/* Ambient violet glow */}
                <div
                    className="pointer-events-none absolute z-[1]"
                    style={{
                        top: -40,
                        right: -40,
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 70%)",
                        filter: "blur(20px)",
                    }}
                />

                {/* ── CONTENT ── */}
                <div className="relative z-[2] flex flex-col h-full">

                    {/* 1. HEADER */}
                    <div
                        className="flex items-center justify-between px-5 shrink-0"
                        style={{ height: 60, borderBottom: "1px solid var(--border)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <LogoMark size={28} />
                            <span className="font-display font-bold text-[13px] tracking-[-0.02em] text-foreground/85">
                                ShonenBuilds
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Close menu"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-95"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* 2. PLAYER CARD */}
                    <div className="px-5 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
                        {loggedIn ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    {/* Avatar with rank ring */}
                                    <div className="relative shrink-0" style={{ width: 56, height: 56 }}>
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(${world.color} 0deg, ${world.color} 259deg, color-mix(in srgb, var(--border) 80%, transparent) 259deg)`,
                                                padding: 2.5,
                                                borderRadius: "50%",
                                                boxShadow: `0 0 14px ${world.glow}`,
                                            }}
                                        >
                                            <div
                                                className="w-full h-full rounded-full flex items-center justify-center text-2xl"
                                                style={{ background: "var(--secondary)" }}
                                            >
                                                {world.icon}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Username + rank pill */}
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <span className="font-display font-bold text-[15px] text-foreground tracking-[-0.02em] truncate">
                                            @{USER_DATA?.username}
                                        </span>
                                        <div
                                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] w-fit"
                                            style={{
                                                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                                                border: "1px solid color-mix(in srgb, var(--primary) 28%, transparent)",
                                            }}
                                        >
                                            <span className="text-[10px] font-body font-bold tracking-[0.08em] uppercase text-primary">
                                                E-RANK · LV 7
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* XP bar */}
                                <div className="flex flex-col gap-1">
                                    <div
                                        className="relative h-1 rounded-full overflow-hidden"
                                        style={{ background: "var(--border)" }}
                                    >
                                        <div
                                            className="absolute inset-y-0 left-0 rounded-full"
                                            style={{
                                                width: xpFilled ? "72%" : "0%",
                                                background: "linear-gradient(90deg,#8A5CF5,#03E4FF)",
                                                boxShadow: "2px 0 10px rgba(3,228,255,0.55)",
                                                transition: "width 1200ms cubic-bezier(0.25,1,0.5,1)",
                                            }}
                                        >
                                            <div
                                                className="absolute top-0 bottom-0 w-2/5 pointer-events-none"
                                                style={{
                                                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)",
                                                    animation: xpFilled ? "glow-slide 1.5s ease 1.5s both" : "none",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-body tracking-[0.04em]">
                                        720 / 1000 XP
                                    </span>
                                </div>

                                {/* Mini badges */}
                                <div className="flex gap-2 mt-3">
                                    <div
                                        className="flex items-center gap-1 rounded-full px-2.5 py-1"
                                        style={{
                                            background: "color-mix(in srgb, var(--gold) 10%, transparent)",
                                            border: "1px solid color-mix(in srgb, var(--gold) 25%, transparent)",
                                        }}
                                    >
                                        <span className="text-[12px]">🔥</span>
                                        <span className="text-[10px] font-body font-bold" style={{ color: "var(--gold)" }}>
                                            9d
                                        </span>
                                    </div>
                                    <div
                                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                                        style={{ background: world.glow, border: `1px solid ${world.color}44` }}
                                    >
                                        <span className="text-[11px]">{world.icon}</span>
                                        <span className="text-[10px] font-body font-bold" style={{ color: world.color }}>
                                            {world.title}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Logged out — lightweight prompt */
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                                        style={{
                                            background: "color-mix(in srgb, var(--secondary) 80%, transparent)",
                                            border: "1.5px dashed var(--border)",
                                        }}
                                    >
                                        👤
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-display font-bold text-[14px] text-foreground">
                                            Not signed in
                                        </span>
                                        <span className="text-[11px] text-muted-foreground font-body">
                                            Sign in to track your journey
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. REALM CTA */}
                    <div className="px-4 py-4 shrink-0">
                        <Link
                            href={loggedIn ? "/realm" : "/auth?login=true"}
                            onClick={onClose}
                            className="w-full rounded-xl font-body font-semibold text-[14px] text-white relative overflow-hidden active:scale-[0.97] transition-transform flex items-center justify-center"
                            style={{
                                height: 48,
                                background: loggedIn
                                    ? "linear-gradient(135deg,#8A5CF5 0%,#6B3DD8 55%,#03E4FF 140%)"
                                    : "linear-gradient(135deg,rgba(138,92,245,0.6),rgba(3,228,255,0.4))",
                                boxShadow: "0 0 24px rgba(138,92,245,0.4), 0 4px 16px rgba(0,0,0,0.35)",
                            }}
                        >
                            <div
                                className="absolute inset-y-0 -left-full w-1/2 pointer-events-none"
                                style={{
                                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
                                    animation: "card-shimmer 3s ease-in-out infinite",
                                }}
                            />
                            {loggedIn ? "Enter Your Realm →" : "Log In"}
                        </Link>
                        {!loggedIn && (
                            <p className="text-center mt-2 text-[11px] text-muted-foreground font-body">
                                <Link href="/" onClick={onClose} className="hover:text-foreground transition-colors">
                                    New warrior →
                                </Link>
                            </p>
                        )}
                    </div>

                    {/* 4. SEPARATOR */}
                    <div className="relative mx-4 shrink-0" style={{ height: 1 }}>
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, var(--border) 15%, var(--border) 85%, transparent)",
                            }}
                        />
                    </div>

                    {/* 5. NAV LINKS */}
                    <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
                        {NAV_ITEMS.map((item, i) => (
                            <NavItem
                                key={item.label}
                                item={item}
                                active={false} /* TODO: wire usePathname() */
                                index={i}
                                visible={visible}
                                onNavigate={onClose}
                            />
                        ))}
                    </nav>

                    {/* 6. FOOTER */}
                    <div
                        className="px-5 pb-7 pt-3 shrink-0"
                        style={{ borderTop: "1px solid color-mix(in srgb, var(--border) 55%, transparent)" }}
                    >
                        <p className="text-[10px] text-muted-foreground font-body mb-2 tracking-[0.08em]">
                            v0.1 · ShonenBuilds
                        </p>
                        {loggedIn && (
                            <button className="text-[12px] font-body transition-colors text-muted-foreground hover:text-destructive active:scale-95 min-h-[44px] flex items-center">
                                Depart →
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
} 