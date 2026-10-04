"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useUser } from "@/lib/auth/UserProvider";
import { getWorld } from "@/lib/world/MPS";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
/*
 * LAYOUT
 * Mobile (< lg): single column — header → profile → sections stacked.
 * Desktop (≥ lg): sticky left sidebar (profile card + section nav w/ scroll-spy),
 * content right. Max width 1280px.
 */
interface SessionRow {
    id: string;
    device: string;
    place: string;
    when: string;
    icon: string;
    current: boolean;
}

/* =========================================================
   STATIC DATA (placeholders until backed by real settings)
   ========================================================= */

const SECTIONS = [
    { id: "character", label: "Character", icon: "🧬" },
    { id: "preferences", label: "Preferences", icon: "🎛️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🛡️" },
    { id: "sessions", label: "Sessions", icon: "📡" },
    { id: "security", label: "Security", icon: "🔐" },
    { id: "danger", label: "Danger Zone", icon: "☠️" },
];

const SESSIONS = [
    { id: "s1", device: "Chrome on Windows", place: "Karachi, PK", when: "Active now", icon: "🖥️", current: true },
    { id: "s2", device: "Safari on iPhone 15", place: "Karachi, PK", when: "3h ago", icon: "📱", current: false },
    { id: "s3", device: "Firefox on macOS", place: "Lahore, PK", when: "6d ago", icon: "💻", current: false },
];

/* =========================================================
   PRIMITIVES
   ========================================================= */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            role="switch"
            aria-checked={on}
            aria-label={label}
            onClick={() => onChange(!on)}
            className="relative shrink-0 rounded-full transition-all duration-300 active:scale-95 hover:cursor-pointer"
            style={{
                width: 46,
                height: 26,
                background: on
                    ? "linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 60%, var(--accent)) 100%)"
                    : "var(--secondary)",
                border: `1px solid ${on ? "color-mix(in srgb, var(--primary) 60%, transparent)" : "var(--border)"}`,
                boxShadow: on
                    ? "0 0 14px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.15)"
                    : "inset 0 1px 2px rgba(0,0,0,0.4)",
            }}
        >
            <span
                className="absolute top-1/2 rounded-full transition-all duration-300"
                style={{
                    width: 20,
                    height: 20,
                    left: on ? 22 : 2,
                    transform: "translateY(-50%)",
                    background: on ? "#fff" : "var(--muted-foreground)",
                    boxShadow: on ? "0 0 10px color-mix(in srgb, var(--accent) 70%, transparent)" : "none",
                    transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                }}
            />
        </button>
    );
}

function Select({
    value,
    options,
    onChange,
    label,
}: {
    value: string;
    options: string[];
    onChange: (v: string) => void;
    label: string;
}) {
    return (
        <div className="relative shrink-0">
            <select
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none rounded-lg pl-3 pr-8 py-1.5 text-[12px] font-body font-semibold text-foreground outline-none hover:cursor-pointer transition-colors hover:border-primary/40"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
            >
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
            >
                <path
                    d="M2 3.5l3 3 3-3"
                    stroke="var(--muted-foreground)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

function Chevron() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 transition-transform group-hover:translate-x-0.5"
        >
            <path
                d="M6 3l5 5-5 5"
                stroke="var(--muted-foreground)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Section({
    id,
    index,
    title,
    kicker,
    children,
    tone,
}: {
    id: string;
    index: number;
    title: string;
    kicker?: ReactNode;
    children: ReactNode;
    tone?: "danger";
}) {
    const danger = tone === "danger";
    return (
        <section id={id} className="scroll-mt-[72px] flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 px-1">
                <span
                    className="font-display font-bold text-[10px] tabular-nums"
                    style={{ color: danger ? "var(--destructive)" : "var(--primary)" }}
                >
                    {String(index).padStart(2, "0")}
                </span>
                <span
                    className="text-[10px] font-body font-bold tracking-[0.22em] uppercase"
                    style={{
                        color: danger ? "var(--destructive)" : "color-mix(in srgb, var(--foreground) 55%, transparent)",
                    }}
                >
                    {title}
                </span>
                <div
                    className="flex-1 h-px"
                    style={{
                        background: danger
                            ? "color-mix(in srgb, var(--destructive) 25%, transparent)"
                            : "var(--border)",
                    }}
                />
                {kicker}
            </div>
            <div
                className="rounded-[18px] overflow-hidden"
                style={{
                    background: danger
                        ? "linear-gradient(180deg, color-mix(in srgb, var(--destructive) 9%, var(--card)) 0%, var(--card) 100%)"
                        : "var(--card)",
                    border: `1px solid ${danger ? "color-mix(in srgb, var(--destructive) 30%, transparent)" : "var(--border)"}`,
                }}
            >
                {children}
            </div>
        </section>
    );
}

function Row({
    icon,
    label,
    hint,
    children,
    last,
    highlight,
    onClick,
}: {
    icon: string;
    label: string;
    hint?: string;
    children?: ReactNode;
    last?: boolean;
    highlight?: boolean;
    onClick?: () => void;
}) {
    const Tag = onClick ? "button" : "div";
    return (
        <Tag
            onClick={onClick}
            className={`group relative w-full flex items-center gap-3 px-4 lg:px-5 py-3.5 text-left transition-colors hover:bg-secondary/40 ${onClick ? "hover:cursor-pointer" : ""}`}
            style={{
                borderBottom: last ? "none" : "1px solid var(--border)",
                background: highlight
                    ? "linear-gradient(90deg, color-mix(in srgb, var(--gold) 9%, transparent), transparent 70%)"
                    : undefined,
            }}
        >
            {highlight && (
                <span
                    className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                    style={{ background: "var(--gold)", boxShadow: "0 0 8px var(--gold)" }}
                />
            )}
            <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[15px] shrink-0"
                style={{
                    background: "color-mix(in srgb, var(--secondary) 80%, transparent)",
                    border: "1px solid var(--border)",
                }}
            >
                {icon}
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-body font-semibold text-[13px] text-foreground leading-tight">{label}</span>
                {hint && <span className="font-body text-[11px] text-muted-foreground leading-snug">{hint}</span>}
            </div>
            {children}
        </Tag>
    );
}

/* =========================================================
   PAGE
   ========================================================= */
export default function Dojo() {
    const router = useRouter();
    const USER_DATA = useUser();
    const user = USER_DATA.user;
    const world = getWorld(user?.world as string);

    const [dark, setDark] = useState(true);
    const [revokeId,setRevokeId] = useState<string|null>(null)
    const [prefs, setPrefs] = useState({ sound: true, haptics: false });
    const [language, setLanguage] = useState("English");
    const [notif, setNotif] = useState({ daily: true, streak: true, rival: true, squad: false, weekly: true });
    const [visibility, setVisibility] = useState("Public");
    const [privacy, setPrivacy] = useState({ feed: true, streak: false });
    const [sessions, setSessions] = useState<SessionRow[]>([]);
    const [active, setActive] = useState(SECTIONS[0].id);
    const [confirmDelete, setConfirmDelete] = useState(false);
    function toRelativeTime(iso: string | null): string {
        if (!iso) return "Unknown";
        const then = new Date(iso).getTime();
        if (isNaN(then)) return "Unknown";
        const mins = Math.floor((Date.now() - then) / 60000);
        if (mins < 1) return "Active now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(iso).toLocaleDateString();
    }

    function pickDeviceIcon(deviceName: string, browser: string | null): string {
        const s = `${deviceName} ${browser ?? ""}`.toLowerCase();
        if (/iphone|android|phone|mobile|ipad|tablet/.test(s)) return "📱";
        if (/mac|macos|macbook/.test(s)) return "💻";
        return "🖥️";
    }

    function toSessionRow(raw: any): SessionRow {
        return {
            id: raw.id,
            device: raw.deviceName || raw.browser || "Unknown device",
            place: [raw.city, raw.country].filter(Boolean).join(", ") || "Unknown location",
            when: raw.current ? "Active now" : toRelativeTime(raw.createdAt),
            icon: pickDeviceIcon(raw.deviceName ?? "", raw.browser),
            current: !!raw.current,
        };
    }

    useEffect(() => {
        async function fetchSessions() {
            try {
                const res = await fetch("/api/users/sessions");
                const data = await res.json();
                if (data.success) {
                    setSessions(data.data.sessions.map(toSessionRow));
                }
            } catch {
                // silent — leave sessions empty
            }
        }
        fetchSessions();

        setDark(!document.documentElement.classList.contains("light"));
    }, []);
    async function handleRevokeOne(id: string) {
        setRevokeId(id)
        const res = await fetch(`/api/users/sessions/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            setSessions((prev) => prev.filter((s) => s.id !== id));
            toast.success("Session revoked");
        } else {
            toast.error(data.error || "Failed to revoke");
        }
        setRevokeId(null)
    }

    async function handleAllSessionRevoke() {
        const res = await fetch("/api/users/sessions", { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            setSessions((prev) => prev.filter((s) => s.current));
            toast.success("All other devices logged out");
        } else {
            toast.error(data.error || "Failed");
        }
    }

    /* Scroll-spy for the desktop nav */
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
            { rootMargin: "-30% 0px -60% 0px" },
        );
        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, [user]);

    const toggleDark = (v: boolean) => {
        setDark(v);
        document.documentElement.classList.toggle("light", !v);
    };

    const pathLabel =
        user?.path === "ancient" ? "Ancient Clan" : user?.path === "shinobi" ? "Shinobi" : (user?.path as string);
    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "—";

    /* ── Profile card (shared mobile + desktop sidebar) ── */
    const profileCard = user && (
        <div
            className="relative overflow-hidden rounded-[20px] p-5"
            style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${world.color} 10%, var(--card)) 0%, var(--card) 65%)`,
                border: `1px solid ${world.border}`,
                boxShadow: `0 0 32px -8px ${world.glow}`,
            }}
        >
            <div
                className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl"
                style={{ background: world.glow, opacity: 0.6 }}
            />
            <div className="relative flex items-center gap-4">
                <div className="relative shrink-0" style={{ width: 68, height: 68 }}>
                    <div
                        className="absolute inset-[-3px] rounded-full"
                        style={{
                            background: `conic-gradient(${world.color} 0deg, var(--accent) 180deg, ${world.color} 360deg)`,
                            filter: `drop-shadow(0 0 10px ${world.glow})`,
                            animation: "orbit-spin 12s linear infinite",
                        }}
                    />
                    <div
                        className="absolute inset-[2px] rounded-full flex items-center justify-center text-[30px]"
                        style={{ background: "linear-gradient(145deg, var(--secondary), var(--card))" }}
                    >
                        {world.icon}
                    </div>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-display font-bold text-[19px] leading-none tracking-[-0.02em] text-foreground truncate">
                        @{user.username}
                    </span>
                    <span className="font-body text-[12px] text-muted-foreground truncate">{user.email}</span>
                    <span className="text-[9px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground/60 mt-0.5">
                        Member since {memberSince}
                    </span>
                </div>
            </div>
            <button
                className="relative mt-4 w-full rounded-xl py-2.5 text-[12px] font-body font-semibold transition-all active:scale-[0.98] hover:cursor-pointer hover:brightness-125"
                style={{
                    color: world.color,
                    background: `color-mix(in srgb, ${world.color} 10%, transparent)`,
                    border: `1px solid ${world.border}`,
                }}
            >
                Change Avatar
            </button>
        </div>
    );

    return (
        <>
            {/* ── Sticky header ── */}
            <div
                className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8"
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
                        <path
                            d="M10 3L5 8l5 5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="text-[12px] font-body">Back</span>
                </button>
                <span className="font-display font-bold text-[13px] lg:text-[14px] tracking-[0.12em] lg:tracking-[0.2em] text-foreground/70 uppercase">
                    Your Dojo
                </span>
                <div
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground"
                    style={{ animation: "orbit-spin 20s linear infinite" }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </div>
            </div>

            {user ? (
                <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-10 lg:max-w-[1280px] lg:mx-auto lg:w-full lg:px-8 lg:py-8 lg:items-start">
                    {/* ═════════════ SIDEBAR (desktop) ═════════════ */}
                    <aside className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-5 sticky top-[76px]">
                        {profileCard}
                        <nav
                            className="flex flex-col gap-0.5 rounded-[18px] p-2"
                            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                        >
                            <span className="px-3 pt-2 pb-2 text-[9px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                                Options
                            </span>
                            {SECTIONS.map((s) => {
                                const isActive = active === s.id;
                                const danger = s.id === "danger";
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() =>
                                            document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })
                                        }
                                        className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:cursor-pointer hover:bg-secondary/50"
                                        style={{
                                            background: isActive
                                                ? `linear-gradient(90deg, color-mix(in srgb, ${danger ? "var(--destructive)" : "var(--primary)"} 16%, transparent), transparent)`
                                                : undefined,
                                        }}
                                    >
                                        {isActive && (
                                            <span
                                                className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                                                style={{
                                                    background: danger ? "var(--destructive)" : "var(--primary)",
                                                    boxShadow: `0 0 10px ${danger ? "var(--destructive)" : "var(--primary)"}`,
                                                }}
                                            />
                                        )}
                                        <span className="text-[14px] w-5 text-center">{s.icon}</span>
                                        <span
                                            className="font-body text-[13px] font-semibold"
                                            style={{
                                                color: isActive
                                                    ? danger
                                                        ? "var(--destructive)"
                                                        : "var(--foreground)"
                                                    : "var(--muted-foreground)",
                                            }}
                                        >
                                            {s.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* ═════════════ CONTENT ═════════════ */}
                    <main className="flex flex-col gap-7 px-4 pt-5 pb-12 lg:px-0 lg:pt-0 lg:col-span-8 xl:col-span-9 lg:max-w-[760px]">
                        {/* Desktop page heading */}
                        <div className="hidden lg:flex flex-col gap-1">
                            <span className="text-[10px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                                Settings · {world.display}
                            </span>
                            <h1 className="font-display font-bold text-[32px] leading-none tracking-[-0.03em] text-foreground">
                                Your Dojo
                            </h1>
                            <p className="font-body text-[13px] text-muted-foreground mt-1">
                                Tune your training ground. Every master keeps a disciplined dojo.
                            </p>
                        </div>

                        {/* Mobile profile card */}
                        <div className="lg:hidden">{profileCard}</div>

                        {/* ═══════ CHARACTER ═══════ */}
                        <Section
                            id="character"
                            index={1}
                            title="Character"
                            kicker={
                                <button
                                    onClick={() => router.push("/ranks")}
                                    className="text-[11px] font-body font-semibold text-muted-foreground hover:text-primary transition-colors hover:cursor-pointer"
                                >
                                    View Ranks →
                                </button>
                            }
                        >
                            <div className="grid grid-cols-2 lg:grid-cols-4">
                                {[
                                    {
                                        label: "World",
                                        icon: world.icon,
                                        value: world.display,
                                        color: world.color,
                                        locked: true,
                                    },
                                    {
                                        label: "Path",
                                        icon: user.path === "ancient" ? "🌊" : "🌪️",
                                        value: pathLabel,
                                        color: world.color,
                                        locked: true,
                                    },
                                    {
                                        label: "Goal",
                                        icon: "🎯",
                                        value: (user.goal as string) ?? "Strength",
                                        color: "var(--accent)",
                                    },
                                    {
                                        label: "Why",
                                        icon: "💭",
                                        value: (user.why as string) ?? "Confidence",
                                        color: "var(--gold)",
                                    },
                                ].map((c, i) => (
                                    <div
                                        key={c.label}
                                        className="relative flex flex-col gap-2 p-4"
                                        style={{
                                            borderRight: i % 2 === 0 ? "1px solid var(--border)" : undefined,
                                            borderBottom: i < 2 ? "1px solid var(--border)" : undefined,
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
                                                {c.label}
                                            </span>
                                            {c.locked && <span className="text-[10px] opacity-50">🔒</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[18px]">{c.icon}</span>
                                            <span
                                                className="font-display font-bold text-[14px] leading-tight tracking-[-0.01em] capitalize"
                                                style={{ color: c.color }}
                                            >
                                                {c.value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="flex items-center gap-2 px-4 py-3 lg:border-t"
                                style={{
                                    background: "color-mix(in srgb, var(--gold) 6%, transparent)",
                                    borderTop: "1px solid var(--border)",
                                }}
                            >
                                <span className="text-[12px]">⚠️</span>
                                <span
                                    className="font-body text-[11px]"
                                    style={{ color: "color-mix(in srgb, var(--gold) 85%, var(--foreground))" }}
                                >
                                    World and Path are permanent. Choose carefully.
                                </span>
                            </div>
                        </Section>

                        {/* ═══════ PREFERENCES ═══════ */}
                        <Section id="preferences" index={2} title="Preferences">
                            <Row icon="🌙" label="Dark mode" hint="The void suits you.">
                                <Toggle label="Dark mode" on={dark} onChange={toggleDark} />
                            </Row>
                            <Row icon="🔊" label="Sound effects" hint="Level-up chimes and hit sounds">
                                <Toggle
                                    label="Sound effects"
                                    on={prefs.sound}
                                    onChange={(v) => setPrefs({ ...prefs, sound: v })}
                                />
                            </Row>
                            <Row icon="📳" label="Haptic feedback" hint="Vibrate on reps and rank-ups">
                                <Toggle
                                    label="Haptic feedback"
                                    on={prefs.haptics}
                                    onChange={(v) => setPrefs({ ...prefs, haptics: v })}
                                />
                            </Row>
                            <Row icon="🌐" label="Language" last>
                                <Select
                                    label="Language"
                                    value={language}
                                    onChange={setLanguage}
                                    options={["English"]}
                                />
                            </Row>
                        </Section>

                        {/* ═══════ NOTIFICATIONS ═══════ */}
                        <Section
                            id="notifications"
                            index={3}
                            title="Notifications"
                            kicker={
                                <span
                                    className="text-[10px] font-body font-bold tabular-nums"
                                    style={{ color: "var(--accent)" }}
                                >
                                    {Object.values(notif).filter(Boolean).length}/5 on
                                </span>
                            }
                        >
                            <Row icon="⏰" label="Daily training reminder" hint="Every day at 7:00 AM">
                                <Toggle
                                    label="Daily training reminder"
                                    on={notif.daily}
                                    onChange={(v) => setNotif({ ...notif, daily: v })}
                                />
                            </Row>
                            <Row
                                icon="🔥"
                                label="Streak about to break"
                                hint={`Warning at 8 PM · protects your ${user.currentStreak ?? 0}-day streak`}
                                highlight
                            >
                                <Toggle
                                    label="Streak about to break"
                                    on={notif.streak}
                                    onChange={(v) => setNotif({ ...notif, streak: v })}
                                />
                            </Row>
                            <Row icon="⚔️" label="Rival challenges">
                                <Toggle
                                    label="Rival challenges"
                                    on={notif.rival}
                                    onChange={(v) => setNotif({ ...notif, rival: v })}
                                />
                            </Row>
                            <Row icon="💬" label="Squad messages">
                                <Toggle
                                    label="Squad messages"
                                    on={notif.squad}
                                    onChange={(v) => setNotif({ ...notif, squad: v })}
                                />
                            </Row>
                            <Row
                                icon="📊"
                                label="Weekly progress summary"
                                hint="Sundays · XP, PRs and rank movement"
                                last
                            >
                                <Toggle
                                    label="Weekly progress summary"
                                    on={notif.weekly}
                                    onChange={(v) => setNotif({ ...notif, weekly: v })}
                                />
                            </Row>
                        </Section>

                        {/* ═══════ PRIVACY ═══════ */}
                        <Section id="privacy" index={4} title="Privacy">
                            <Row icon="🏆" label="Leaderboard visibility" hint="Who can see your rank and power level">
                                <Select
                                    label="Leaderboard visibility"
                                    value={visibility}
                                    onChange={setVisibility}
                                    options={["Public", "Friends", "Private"]}
                                />
                            </Row>
                            <Row icon="📰" label="Show activity feed publicly">
                                <Toggle
                                    label="Show activity feed publicly"
                                    on={privacy.feed}
                                    onChange={(v) => setPrivacy({ ...privacy, feed: v })}
                                />
                            </Row>
                            <Row icon="🔥" label="Show streak publicly" last>
                                <Toggle
                                    label="Show streak publicly"
                                    on={privacy.streak}
                                    onChange={(v) => setPrivacy({ ...privacy, streak: v })}
                                />
                            </Row>
                        </Section>

                        {/* ═══════ SESSIONS ═══════ */}
                        <Section
                            id="sessions"
                            index={5}
                            title="Sessions"
                            kicker={
                                <span className="text-[10px] font-body font-bold text-muted-foreground tabular-nums">
                                    {sessions.length} active
                                </span>
                            }
                        >
                            {sessions.map((s, i) => (
                                <Row
                                    key={s.id}
                                    icon={s.icon}
                                    label={s.device}
                                    hint={`${s.place} · ${s.when}`}
                                    last={i === sessions.length - 1}
                                >
                                    {s.current ? (
                                        <span
                                            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-body font-bold tracking-[0.08em] uppercase"
                                            style={{
                                                color: "var(--accent)",
                                                background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                                                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                                            }}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                style={{ background: "var(--accent)" }}
                                            />
                                            This device
                                        </span>
                                    ) : (
                                        <button
                                        disabled={revokeId?true:false}
                                            onClick={() => {handleRevokeOne(s.id)}}
                                            className={`rounded-lg px-3 py-1.5 text-[11px] font-body font-semibold text-muted-foreground transition-all hover:cursor-pointer hover:text-[var(--destructive)] active:scale-95 `}
                                            style={{ border: "1px solid var(--border)" }}
                                        >
                                            {revokeId === s.id ?'Removing...' :'Revoke'}
                                        </button>
                                    )}
                                </Row>
                            ))}
                            <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
                                <button
                                    onClick={handleAllSessionRevoke }
                                    className="w-full rounded-xl py-2.5 text-[12px] font-body font-semibold transition-all hover:cursor-pointer active:scale-[0.98] hover:bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)]"
                                    style={{
                                        color: "var(--destructive)",
                                        border: "1px solid color-mix(in srgb, var(--destructive) 45%, transparent)",
                                    }}
                                >
                                    Log out of all devices
                                </button>
                            </div>
                        </Section>

                        {/* ═══════ SECURITY ═══════ */}
                        <Section id="security" index={6} title="Security">
                            <Row
                                icon="🔑"
                                label="Change password"
                                hint="Last changed 3 months ago"
                                onClick={() => router.push("/dojo/password")}
                            >
                                <Chevron />
                            </Row>
                            <Row icon="🛡️" label="Two-factor authentication">
                                <span
                                    className="rounded-full px-2.5 py-1 text-[9px] font-body font-bold tracking-[0.14em] uppercase"
                                    style={{
                                        color: "var(--gold)",
                                        background: "color-mix(in srgb, var(--gold) 10%, transparent)",
                                        border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)",
                                    }}
                                >
                                    Coming Soon
                                </span>
                            </Row>
                            <Row
                                icon="📦"
                                label="Download my data"
                                hint="Training logs, XP history and ranks"
                                onClick={() => {}}
                                last
                            >
                                <Chevron />
                            </Row>
                        </Section>

                        {/* ═══════ DANGER ZONE ═══════ */}
                        <Section id="danger" index={7} title="Danger Zone" tone="danger">
                            <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                                <div className="flex items-start gap-3 flex-1">
                                    <div
                                        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px] shrink-0"
                                        style={{
                                            background: "color-mix(in srgb, var(--destructive) 12%, transparent)",
                                            border: "1px solid color-mix(in srgb, var(--destructive) 30%, transparent)",
                                        }}
                                    >
                                        ☠️
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-display font-bold text-[15px] text-foreground">
                                            Delete Account
                                        </span>
                                        <span className="font-body text-[12px] text-muted-foreground leading-snug">
                                            This cannot be undone. Your rank, XP, and mastery will be permanently
                                            deleted.
                                        </span>
                                    </div>
                                </div>
                                {confirmDelete ? (
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => setConfirmDelete(false)}
                                            className="flex-1 lg:flex-none rounded-xl px-4 py-2.5 text-[12px] font-body font-semibold text-muted-foreground hover:text-foreground hover:cursor-pointer"
                                            style={{ border: "1px solid var(--border)" }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="flex-1 lg:flex-none rounded-xl px-4 py-2.5 text-[12px] font-body font-bold text-white hover:cursor-pointer active:scale-[0.98]"
                                            style={{
                                                background: "var(--destructive)",
                                                boxShadow:
                                                    "0 0 20px color-mix(in srgb, var(--destructive) 45%, transparent)",
                                            }}
                                        >
                                            Yes, delete forever
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDelete(true)}
                                        className="shrink-0 rounded-xl px-5 py-2.5 text-[12px] font-body font-semibold transition-all hover:cursor-pointer active:scale-[0.98] hover:bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)]"
                                        style={{
                                            color: "var(--destructive)",
                                            border: "1px solid color-mix(in srgb, var(--destructive) 55%, transparent)",
                                        }}
                                    >
                                        Delete Account
                                    </button>
                                )}
                            </div>
                        </Section>
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
