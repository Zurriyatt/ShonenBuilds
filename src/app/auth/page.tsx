"use client";
import { useState, useEffect } from "react";
import { Thumbmark } from "@thumbmarkjs/thumbmarkjs";
import Link from "next/link";
/* =========================================================
   TYPES
   ========================================================= */
type Screen = "onboarding" | "login";
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
    goal: string;
    why: string;
    world: string;
    fullName: string;
    username: string;
    email: string;
    password: string;
}

/* =========================================================
   STATIC DATA
   ========================================================= */
const GOALS = [
    { id: "strength", icon: "💪", title: "Strength", sub: "Build raw power & peak output" },
    { id: "skill", icon: "🎯", title: "Skill", sub: "Master technique & movement" },
    { id: "endurance", icon: "🏃", title: "Endurance", sub: "Outlast. Outgrind. Outlive." },
    { id: "aesthetics", icon: "✨", title: "Aesthetics", sub: "Sculpt the body you deserve" },
];

const WHYS = [
    { id: "confidence", icon: "🧠", title: "Confidence", sub: "Own every room you walk into" },
    { id: "health", icon: "❤️", title: "Health", sub: "Invest in your longest asset" },
    { id: "competition", icon: "🏆", title: "Competition", sub: "Rise through the ranked ladder" },
    { id: "discipline", icon: "⚔️", title: "Discipline", sub: "Forge unbreakable daily habits" },
];

const WORLDS = [
    {
        id: "shinobi",
        title: "Shinobi World",
        icon: "🥷",
        sub: "Master chakra, stealth & ninjutsu",
        color: "#03E4FF",
        glow: "rgba(3,228,255,0.22)",
        border: "rgba(3,228,255,0.35)",
        tier: "Genin → Kage",
    },
    {
        id: "hunter",
        title: "Hunter World",
        icon: "⚡",
        sub: "Awaken your Nen. Rise to True Monarch",
        color: "#8A5CF5",
        glow: "rgba(138,92,245,0.25)",
        border: "rgba(138,92,245,0.42)",
        tier: "E-Rank → SSS-Rank",
    },
    {
        id: "pirate",
        title: "Pirate World",
        icon: "⚓",
        sub: "Sail the Grand Sea. Forge a legendary crew",
        color: "#38BDF8",
        glow: "rgba(56,189,248,0.2)",
        border: "rgba(56,189,248,0.32)",
        tier: "Rookie → Yonko",
    },
    {
        id: "soul",
        title: "Soul World",
        icon: "🌀",
        sub: "Wield spiritual pressure. Command the unseen",
        color: "#F5A41E",
        glow: "rgba(245,164,30,0.2)",
        border: "rgba(245,164,30,0.35)",
        tier: "Academy → Soul Sovereign",
    },
    {
        id: "demon",
        title: "Demon World",
        icon: "🔥",
        sub: "Consume demons. Ascend through breathing arts",
        color: "#F87171",
        glow: "rgba(248,113,113,0.2)",
        border: "rgba(248,113,113,0.35)",
        tier: "Combatant → Arch-Demon",
    },
    {
        id: "game",
        title: "Game World",
        icon: "🎮",
        sub: "Compete. Dominate. Claim sovereign rank",
        color: "#10B981",
        glow: "rgba(16,185,129,0.2)",
        border: "rgba(16,185,129,0.32)",
        tier: "Silver → Sovereign / Mythic",
    },
    {
        id: "multiverse",
        title: "Multiverse",
        icon: "✦",
        sub: "Pure human ranking · Novice → Apex Sovereign Prime",
        color: "#C084FC",
        glow: "rgba(192,132,252,0.2)",
        border: "rgba(192,132,252,0.35)",
        tier: "E-Rank (Novice) → Apex",
        isSpecial: true,
    },
];

const WORLD_PREVIEWS = WORLDS.map((w) => ({ icon: w.icon, label: w.title.replace(" World", ""), color: w.color }));

/* =========================================================
   FINGERPRINT HELPER
   ========================================================= */
let cachedFingerprint: string | null = null;

async function getFingerprint(): Promise<string> {
    if (cachedFingerprint) return cachedFingerprint;
    const tm = new Thumbmark();
    const { thumbmark } = await tm.get();
    cachedFingerprint = thumbmark;
    return thumbmark;
}

/* =========================================================
   HELPERS
   ========================================================= */
function getPasswordStrength(pwd: string) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return {
        score,
        label: ["Weak", "Fair", "Strong", "Apex"][score - 1] ?? "Weak",
        color:
            ["var(--destructive)", "var(--gold)", "var(--primary)", "var(--accent)"][score - 1] ?? "var(--destructive)",
    };
}

/* =========================================================
   SHARED: INPUT
   ========================================================= */
function Input({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    autoFocus,
    suffix,
}: {
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    autoFocus?: boolean;
    suffix?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted-foreground font-body tracking-[0.09em] uppercase font-semibold">
                {label}
            </label>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-[14px] text-foreground font-body placeholder:text-muted-foreground/40 transition-all duration-200 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_10%,transparent)] pr-12"
                />
                {suffix && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>}
            </div>
        </div>
    );
}

/* =========================================================
   SHARED: CHOICE GRID
   ========================================================= */
function ChoiceGrid({
    items,
    selected,
    onSelect,
}: {
    items: { id: string; icon: string; title: string; sub: string }[];
    selected: string;
    onSelect: (id: string) => void;
}) {
    const [hovered, setHovered] = useState<string | null>(null);
    return (
        <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
                const isSelected = selected === item.id;
                const isHovered = hovered === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        onMouseEnter={() => setHovered(item.id)}
                        onMouseLeave={() => setHovered(null)}
                        className="relative flex flex-col items-start gap-2.5 rounded-2xl p-4 text-left transition-all duration-200 overflow-hidden"
                        style={{
                            background: isSelected
                                ? "linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, transparent) 0%, color-mix(in srgb, var(--card) 95%, transparent) 100%)"
                                : isHovered
                                  ? "color-mix(in srgb, var(--secondary) 90%, transparent)"
                                  : "color-mix(in srgb, var(--card) 70%, transparent)",
                            border: isSelected
                                ? "1.5px solid color-mix(in srgb, var(--primary) 55%, transparent)"
                                : isHovered
                                  ? "1.5px solid color-mix(in srgb, var(--primary) 28%, transparent)"
                                  : "1.5px solid color-mix(in srgb, var(--border) 80%, transparent)",
                            boxShadow: isSelected
                                ? "0 0 20px color-mix(in srgb, var(--primary) 18%, transparent), inset 0 0 30px color-mix(in srgb, var(--primary) 6%, transparent)"
                                : "none",
                        }}
                    >
                        {isSelected && (
                            <div
                                className="absolute top-2.5 right-2.5 rounded-full bg-primary flex items-center justify-center w-[18px] h-[18px]"
                                style={{ boxShadow: "0 0 8px color-mix(in srgb, var(--primary) 60%, transparent)" }}
                            >
                                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                    <path
                                        d="M1.5 4.5l2 2 4-4"
                                        stroke="var(--primary-foreground)"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        )}
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-200"
                            style={{
                                background:
                                    isSelected || isHovered
                                        ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                                        : "color-mix(in srgb, var(--secondary) 80%, transparent)",
                                border: `1px solid ${isSelected ? "color-mix(in srgb, var(--primary) 45%, transparent)" : "color-mix(in srgb, var(--border) 60%, transparent)"}`,
                            }}
                        >
                            {item.icon}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span
                                className="font-display font-bold text-[13px] leading-tight"
                                style={{ color: isSelected ? "var(--primary)" : "var(--foreground)" }}
                            >
                                {item.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-body leading-snug">{item.sub}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

/* =========================================================
   SHARED: PRIMARY BUTTON
   ========================================================= */
function PrimaryButton({
    onClick,
    disabled,
    children,
    gradient = "violet",
}: {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    gradient?: "violet" | "cyan" | "gold" | "world";
}) {
    const bg = {
        violet: "linear-gradient(135deg,#8A5CF5 0%,#6B3DD8 60%,#03E4FF 140%)",
        cyan: "linear-gradient(135deg,#03E4FF 0%,#8A5CF5 100%)",
        gold: "linear-gradient(135deg,#F5A41E 0%,#8A5CF5 60%,#03E4FF 130%)",
        world: "linear-gradient(135deg,#8A5CF5 0%,#03E4FF 100%)",
    }[gradient];
    const shadow = {
        violet: "0 0 28px color-mix(in srgb, var(--primary) 45%, transparent), 0 4px 16px rgba(0,0,0,0.2)",
        cyan: "0 0 28px color-mix(in srgb, var(--accent) 30%, transparent), 0 4px 16px rgba(0,0,0,0.2)",
        gold: "0 0 32px color-mix(in srgb, var(--primary) 50%, transparent), 0 4px 20px rgba(0,0,0,0.2)",
        world: "0 0 32px color-mix(in srgb, var(--primary) 50%, transparent), 0 4px 20px rgba(0,0,0,0.2)",
    }[gradient];
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full rounded-xl py-3.5 text-[14px] font-semibold font-body tracking-[-0.01em] transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden"
            style={{
                background: disabled ? "color-mix(in srgb, var(--primary) 12%, transparent)" : bg,
                color: "var(--primary-foreground)",
                boxShadow: disabled ? "none" : shadow,
            }}
        >
            {children}
        </button>
    );
}

/* =========================================================
   STEP 0 — TEASER
   ========================================================= */
function StepTeaser({ onBegin }: { onBegin: () => void }) {
    const [countdown, setCountdown] = useState(15);
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        if (countdown === 0) {
            onBegin();
            return;
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, onBegin]);

    useEffect(() => {
        let raf: number;
        const tick = () => {
            setAngle((a) => a + 0.22);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    const radius = 108;

    return (
        <div className="flex flex-col items-center gap-7 text-center py-2 select-none">
            <div className="relative flex items-center justify-center w-[260px] h-[260px]">
                <div
                    className="absolute rounded-full w-[100px] h-[100px]"
                    style={{
                        background:
                            "radial-gradient(circle, color-mix(in srgb, var(--primary) 40%, transparent) 0%, transparent 70%)",
                        filter: "blur(20px)",
                    }}
                />
                <div
                    className="absolute z-10 flex items-center justify-center rounded-full animate-fade-up w-[72px] h-[72px]"
                    style={{
                        background:
                            "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 96%, transparent), color-mix(in srgb, var(--card) 98%, transparent))",
                        border: "2px solid color-mix(in srgb, var(--primary) 50%, transparent)",
                        boxShadow:
                            "0 0 32px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 0 20px color-mix(in srgb, var(--primary) 6%, transparent)",
                    }}
                >
                    <svg width="26" height="28" viewBox="0 0 16 18" fill="none">
                        <path
                            d="M13 5.5C13 4 11.5 3 9 3C6.5 3 4.5 4.2 4.5 6C4.5 7.8 6.5 8.5 8.5 9C10.5 9.5 13 10.5 13 12.5C13 14.5 11 15.5 8.5 15.5C6 15.5 3.5 14.2 3 12.5"
                            stroke="url(#tG)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="tG" x1="3" y1="3" x2="13" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#8A5CF5" />
                                <stop offset="1" stopColor="#03E4FF" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div
                    className="absolute rounded-full"
                    style={{
                        width: radius * 2 + 16,
                        height: radius * 2 + 16,
                        border: "1px dashed color-mix(in srgb, var(--primary) 18%, transparent)",
                    }}
                />
                {WORLD_PREVIEWS.map((w, i) => {
                    const a = (angle + (i / WORLD_PREVIEWS.length) * 360) * (Math.PI / 180);
                    return (
                        <div
                            key={i}
                            className="absolute transition-none"
                            style={{
                                left: "50%",
                                top: "50%",
                                transform: `translate(${Math.cos(a) * radius}px, ${Math.sin(a) * radius}px)`,
                                marginLeft: -18,
                                marginTop: -18,
                            }}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                                style={{
                                    background: "color-mix(in srgb, var(--card) 92%, transparent)",
                                    border: `1.5px solid ${w.color}44`,
                                    boxShadow: `0 0 10px ${w.color}28`,
                                }}
                            >
                                {w.icon}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 animate-fade-up-1">
                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-3 py-1 mx-auto">
                    <span className="text-gold text-[10px]">✦</span>
                    <span className="text-[11px] text-gold font-semibold tracking-[0.1em] uppercase font-body">
                        Character Creation
                    </span>
                </div>
                <h2 className="font-display font-bold text-[clamp(24px,5vw,34px)] leading-tight tracking-[-0.03em] text-foreground">
                    Build your character.{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Unlock your world.
                    </span>
                </h2>
                <p className="text-[14px] text-muted-foreground font-body leading-relaxed max-w-[320px] mx-auto">
                    Create your character to unlock your starter world — then climb from{" "}
                    <span className="text-foreground font-medium">E-Rank Novice</span> to{" "}
                    <span className="text-gold font-medium">Apex Sovereign Prime</span>. Every rep earns XP.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 animate-fade-up-2">
                {WORLD_PREVIEWS.map((w, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-body font-medium"
                        style={{ background: `${w.color}12`, border: `1px solid ${w.color}28`, color: w.color }}
                    >
                        <span>{w.icon}</span>
                        {w.label}
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center gap-2.5 w-full animate-fade-up-3">
                <PrimaryButton onClick={onBegin} gradient="violet">
                    Build My Character →
                </PrimaryButton>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-body">
                    <svg width="14" height="14" viewBox="0 0 14 14">
                        <circle cx="7" cy="7" r="5.5" stroke="var(--border)" strokeWidth="2" fill="none" />
                        <circle
                            cx="7"
                            cy="7"
                            r="5.5"
                            stroke="var(--primary)"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${(1 - countdown / 15) * 34.6} 34.6`}
                            strokeLinecap="round"
                            transform="rotate(-90 7 7)"
                            style={{ transition: "stroke-dasharray 0.9s linear" }}
                        />
                    </svg>
                    Auto-starting in {countdown}s
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   STEP 1 — GOAL
   ========================================================= */
function StepGoal({
    data,
    setData,
    onNext,
}: {
    data: FormData;
    setData: (d: Partial<FormData>) => void;
    onNext: () => void;
}) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 animate-fade-up-1">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-3 py-1 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[11px] text-primary font-semibold tracking-[0.08em] uppercase font-body">
                        Training Goal
                    </span>
                </div>
                <h2 className="font-display font-bold text-[clamp(22px,5vw,32px)] leading-tight tracking-[-0.03em] text-foreground">
                    What are you{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        training for?
                    </span>
                </h2>
                <p className="text-[13px] text-muted-foreground font-body leading-relaxed">
                    Your goal shapes your skill tree and the challenges thrown at you.
                </p>
            </div>
            <div className="animate-fade-up-2">
                <ChoiceGrid items={GOALS} selected={data.goal} onSelect={(id) => setData({ goal: id })} />
            </div>
            <div className="animate-fade-up-3">
                <PrimaryButton onClick={onNext} disabled={!data.goal} gradient="violet">
                    Continue →
                </PrimaryButton>
            </div>
        </div>
    );
}

/* =========================================================
   STEP 2 — WHY
   ========================================================= */
function StepWhy({
    data,
    setData,
    onNext,
}: {
    data: FormData;
    setData: (d: Partial<FormData>) => void;
    onNext: () => void;
}) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 animate-fade-up-1">
                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-3 py-1 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[11px] text-accent font-semibold tracking-[0.08em] uppercase font-body">
                        Your Drive
                    </span>
                </div>
                <h2 className="font-display font-bold text-[clamp(22px,5vw,32px)] leading-tight tracking-[-0.03em] text-foreground">
                    What drives{" "}
                    <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                        you forward?
                    </span>
                </h2>
                <p className="text-[13px] text-muted-foreground font-body leading-relaxed">
                    Your motivation unlocks the right rival pool and daily challenge type.
                </p>
            </div>
            <div className="animate-fade-up-2">
                <ChoiceGrid items={WHYS} selected={data.why} onSelect={(id) => setData({ why: id })} />
            </div>
            <div className="animate-fade-up-3">
                <PrimaryButton onClick={onNext} disabled={!data.why} gradient="cyan">
                    Continue →
                </PrimaryButton>
            </div>
        </div>
    );
}

/* =========================================================
   STEP 3 — WORLD SELECTION
   ========================================================= */
function StepWorldSelection({
    data,
    setData,
    onNext,
}: {
    data: FormData;
    setData: (d: Partial<FormData>) => void;
    onNext: () => void;
}) {
    const [hovered, setHovered] = useState<string | null>(null);
    const selected = data.world;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 animate-fade-up-1">
                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-3 py-1 w-fit">
                    <span className="text-gold text-[10px]">✦</span>
                    <span className="text-[11px] text-gold font-semibold tracking-[0.08em] uppercase font-body">
                        Realm Binding
                    </span>
                </div>
                <h2 className="font-display font-bold text-[clamp(22px,4vw,30px)] leading-tight tracking-[-0.03em] text-foreground">
                    Choose Your{" "}
                    <span className="bg-gradient-to-r from-gold to-primary bg-clip-text text-transparent">Realm.</span>
                </h2>
                <p className="text-[13px] text-muted-foreground font-body leading-relaxed">
                    Your realm determines your rank path, skill tree & rival pool.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 animate-fade-up-2">
                {WORLDS.map((w) => {
                    const isSel = selected === w.id;
                    const isHov = hovered === w.id;
                    return (
                        <button
                            key={w.id}
                            onClick={() => setData({ world: w.id })}
                            onMouseEnter={() => setHovered(w.id)}
                            onMouseLeave={() => setHovered(null)}
                            className={`relative flex flex-col items-start gap-2 rounded-2xl p-3.5 text-left transition-all duration-200 overflow-hidden ${w.isSpecial ? "col-span-2 sm:col-span-1" : ""}`}
                            style={{
                                background: isSel
                                    ? `linear-gradient(135deg, ${w.glow} 0%, color-mix(in srgb, var(--card) 96%, transparent) 100%)`
                                    : isHov
                                      ? "color-mix(in srgb, var(--card) 90%, transparent)"
                                      : "color-mix(in srgb, var(--card) 60%, transparent)",
                                border: isSel
                                    ? `1.5px solid ${w.border}`
                                    : isHov
                                      ? `1.5px solid ${w.border}`
                                      : "1.5px solid color-mix(in srgb, var(--border) 75%, transparent)",
                                boxShadow: isSel
                                    ? `0 0 22px ${w.glow}, inset 0 0 36px ${w.glow}`
                                    : isHov
                                      ? `0 0 10px ${w.glow}`
                                      : "none",
                            }}
                        >
                            {(isSel || isHov) && (
                                <div
                                    className="absolute top-0 -left-full w-1/2 h-full opacity-20 pointer-events-none"
                                    style={{
                                        background: `linear-gradient(90deg,transparent,${w.color},transparent)`,
                                        animation: "card-shimmer 1.1s ease both",
                                    }}
                                />
                            )}
                            {isSel && (
                                <div
                                    className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                                    style={{ background: w.color, boxShadow: `0 0 8px ${w.glow}` }}
                                >
                                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                        <path
                                            d="M1.5 4.5l2 2 4-4"
                                            stroke="var(--primary-foreground)"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            )}
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-200"
                                style={{
                                    background:
                                        isSel || isHov
                                            ? w.glow
                                            : "color-mix(in srgb, var(--secondary) 80%, transparent)",
                                    border: `1px solid ${isSel || isHov ? w.border : "color-mix(in srgb, var(--border) 60%, transparent)"}`,
                                    boxShadow: isSel ? `0 0 10px ${w.glow}` : "none",
                                }}
                            >
                                {w.icon}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span
                                    className="font-display font-bold text-[12px] leading-tight transition-colors duration-200"
                                    style={{ color: isSel || isHov ? w.color : "var(--foreground)" }}
                                >
                                    {w.title}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-body leading-snug line-clamp-2">
                                    {w.sub}
                                </span>
                            </div>
                            <div
                                className="mt-auto text-[8px] font-body font-semibold tracking-wider px-1.5 py-0.5 rounded-full"
                                style={{
                                    color: w.color,
                                    background: w.glow,
                                    border: `1px solid ${w.border}`,
                                    opacity: isSel || isHov ? 1 : 0.5,
                                }}
                            >
                                {w.tier}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="animate-fade-up-3">
                <PrimaryButton onClick={onNext} disabled={!selected} gradient="gold">
                    {selected ? `Enter ${WORLDS.find((w) => w.id === selected)?.title} ✦` : "Select Your Realm"}
                </PrimaryButton>
            </div>
        </div>
    );
}

/* =========================================================
   STEP 4 — RANK REVEAL
   ========================================================= */
function StepRankReveal({ data, onNext }: { data: FormData; onNext: () => void }) {
    const world = WORLDS.find((w) => w.id === data.world)!;
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 600);
        const t2 = setTimeout(() => setPhase(2), 1600);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-6 text-center py-4 select-none">
            <div className="relative flex items-center justify-center w-40 h-40">
                {[1, 2, 3].map((r) => (
                    <div
                        key={r}
                        className="absolute rounded-full"
                        style={{
                            width: r * 48 + 64,
                            height: r * 48 + 64,
                            background: `radial-gradient(circle,${world.color}${Math.round(14 / r)
                                .toString(16)
                                .padStart(2, "0")} 0%,transparent 70%)`,
                            animation:
                                phase >= 1 ? `orb-pulse ${2 + r * 0.5}s ease-in-out infinite ${r * 0.2}s` : "none",
                        }}
                    />
                ))}
                <div
                    className="relative z-10 flex items-center justify-center rounded-full text-5xl w-24 h-24"
                    style={{
                        background: `radial-gradient(circle, ${world.glow} 0%, color-mix(in srgb, var(--card) 95%, transparent) 70%)`,
                        border: `2px solid ${world.border}`,
                        boxShadow: `0 0 48px ${world.glow}, 0 0 80px ${world.glow}`,
                        transform: phase >= 1 ? "scale(1)" : "scale(0.5)",
                        opacity: phase >= 1 ? 1 : 0,
                        transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
                    }}
                >
                    {world.icon}
                </div>
            </div>

            <div
                className="flex flex-col gap-2"
                style={{
                    opacity: phase >= 1 ? 1 : 0,
                    transform: phase >= 1 ? "translateY(0)" : "translateY(16px)",
                    transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s",
                }}
            >
                <p className="text-[12px] text-muted-foreground font-body tracking-[0.12em] uppercase">
                    Your rank has been assigned
                </p>
                <h2 className="font-display font-bold text-[clamp(26px,6vw,40px)] leading-tight tracking-[-0.03em] text-foreground">
                    You are{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        E-Rank
                    </span>
                </h2>
                <p className="font-display font-semibold text-[18px]" style={{ color: world.color }}>
                    {world.title}
                </p>
            </div>

            <div
                className="flex items-stretch gap-0 rounded-xl overflow-hidden border animate-fade-up-2"
                style={{ borderColor: world.border, opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease" }}
            >
                {[
                    { label: "Tier", value: "1 / 10" },
                    { label: "Universal", value: "E-Rank (Novice)" },
                    { label: world.title.replace(" World", "") + " Path", value: world.tier.split("→")[0].trim() },
                ].map((cell, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-0.5 px-4 py-3"
                        style={{ background: world.glow, borderRight: i < 2 ? `1px solid ${world.border}` : "none" }}
                    >
                        <span className="text-[9px] text-muted-foreground font-body tracking-widest uppercase">
                            {cell.label}
                        </span>
                        <span className="font-display font-bold text-[13px]" style={{ color: world.color }}>
                            {cell.value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="w-full" style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}>
                <PrimaryButton onClick={onNext} gradient="world">
                    Claim Your Rank — Create Account →
                </PrimaryButton>
                <p className="text-[11px] text-muted-foreground font-body mt-2">
                    One final step to lock in your character
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   STEP 5 — IDENTITY + CREDENTIALS
   ========================================================= */
function StepIdentityCredentials({
    data,
    setData,
    onNext,
}: {
    data: FormData;
    setData: (d: Partial<FormData>) => void;
    onNext: () => void;
}) {
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const strength = getPasswordStrength(data.password);
    const world = WORLDS.find((w) => w.id === data.world);

    const canProceed =
        data.fullName.trim().length >= 2 &&
        data.username.trim().length >= 3 &&
        data.email.includes("@") &&
        data.email.includes(".") &&
        data.password.length >= 8;

    const handleSubmit = async () => {
        if (!canProceed || loading) return;

        setLoading(true);
        setError(null);

        try {
            const fingerprint = await getFingerprint();

            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, fingerprint }),
            });

            const json = await res.json();

            if (!json.success) {
                setError(json.error || "Signup failed");
                setLoading(false);
                return;
            }

            onNext();
        } catch (err) {
            console.error("Signup error:", err);
            setError("Network error. Try again.");
            setLoading(false);
        }
    };

    const EyeIcon = ({ open }: { open: boolean }) =>
        open ? (
            <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
        ) : (
            <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        );

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 animate-fade-up-1">
                {world && (
                    <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 py-2 mb-1">
                        <span className="text-xl">{world.icon}</span>
                        <div className="flex flex-col gap-0">
                            <span className="text-[10px] text-muted-foreground font-body">Binding to</span>
                            <span className="font-display font-bold text-[12px]" style={{ color: world.color }}>
                                {world.title} · E-Rank Novice
                            </span>
                        </div>
                        <div
                            className="ml-auto w-2 h-2 rounded-full animate-pulse"
                            style={{ background: world.color }}
                        />
                    </div>
                )}
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-3 py-1 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[11px] text-primary font-semibold tracking-[0.08em] uppercase font-body">
                        Final Step
                    </span>
                </div>
                <h2 className="font-display font-bold text-[clamp(22px,5vw,30px)] leading-tight tracking-[-0.03em] text-foreground">
                    Name your{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        character.
                    </span>
                </h2>
                <p className="text-[13px] text-muted-foreground font-body leading-relaxed">
                    Your warrior profile is permanent. Your credentials secure it.
                </p>
            </div>

            <div className="flex flex-col gap-3 animate-fade-up-2">
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Full Name"
                        value={data.fullName}
                        onChange={(v) => setData({ fullName: v })}
                        placeholder="e.g. Zuri Hunter"
                        autoFocus
                    />
                    <Input
                        label="Username"
                        value={data.username}
                        onChange={(v) => setData({ username: v.toLowerCase().replace(/\s/g, "_") })}
                        placeholder="e.g. zuri_nen"
                    />
                </div>
                <Input
                    label="Email Address"
                    type="email"
                    value={data.email}
                    onChange={(v) => setData({ email: v })}
                    placeholder="warrior@shonenbuilds.gg"
                />
                <div className="flex flex-col gap-1.5">
                    <Input
                        label="Password"
                        type={showPwd ? "text" : "password"}
                        value={data.password}
                        onChange={(v) => setData({ password: v })}
                        placeholder="Min. 8 characters"
                        suffix={
                            <button
                                type="button"
                                onClick={() => setShowPwd((p) => !p)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <EyeIcon open={showPwd} />
                            </button>
                        }
                    />
                    {data.password.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex-1 h-0.5 rounded-full transition-all duration-300"
                                    style={{ background: i < strength.score ? strength.color : "var(--border)" }}
                                />
                            ))}
                            <span
                                className="text-[10px] font-body ml-1 whitespace-nowrap"
                                style={{ color: strength.color }}
                            >
                                {strength.label}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="text-[12px] text-destructive font-body text-center animate-fade-up-3">{error}</div>
            )}

            <div className="animate-fade-up-3">
                <PrimaryButton onClick={handleSubmit} disabled={!canProceed || loading} gradient="violet">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeOpacity="0.3"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M12 2a10 10 0 0 1 10 10"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            </svg>
                            Forging your profile…
                        </span>
                    ) : (
                        "Create My Warrior Profile ✦"
                    )}
                </PrimaryButton>
            </div>
        </div>
    );
}

/* =========================================================
   STEP 6 — COMPLETE
   ========================================================= */
function StepComplete({ data }: { data: FormData }) {
    const world = WORLDS.find((w) => w.id === data.world)!;
    const goal = GOALS.find((g) => g.id === data.goal);
    const why = WHYS.find((w) => w.id === data.why);

    return (
        <div className="flex flex-col items-center gap-6 text-center py-2">
            <div className="relative flex items-center justify-center w-[120px] h-[120px]">
                <div
                    className="absolute rounded-full w-[120px] h-[120px]"
                    style={{
                        background: `radial-gradient(circle,${world.glow} 0%,transparent 70%)`,
                        filter: "blur(16px)",
                    }}
                />
                <div
                    className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-step-pop"
                    style={{
                        background: `radial-gradient(circle, ${world.glow} 0%, color-mix(in srgb, var(--card) 95%, transparent) 70%)`,
                        border: `2px solid ${world.border}`,
                        boxShadow: `0 0 40px ${world.glow}`,
                    }}
                >
                    {world.icon}
                </div>
            </div>

            <div className="flex flex-col gap-2 animate-fade-up-1">
                <h2 className="font-display font-bold text-[clamp(24px,5vw,34px)] leading-tight tracking-[-0.03em]">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Welcome, {data.username || data.fullName.split(" ")[0]}
                    </span>
                </h2>
                <p className="text-[13px] text-muted-foreground font-body max-w-[300px] mx-auto leading-relaxed">
                    Bound to the{" "}
                    <span className="font-semibold" style={{ color: world.color }}>
                        {world.title}
                    </span>
                    . Training for <span className="text-foreground font-medium">{goal?.title}</span>. Driven by{" "}
                    <span className="text-foreground font-medium">{why?.title}</span>.
                </p>
            </div>

            <div className="w-full grid grid-cols-3 gap-0 rounded-xl overflow-hidden border border-border animate-fade-up-2">
                {[
                    { label: "Starting Rank", value: "E-Rank", color: world.color },
                    { label: "Realm", value: world.title, color: world.color },
                    { label: "Goal", value: goal?.title ?? "—", color: "var(--primary)" },
                ].map((c, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-0.5 px-3 py-3 bg-card"
                        style={{
                            borderRight: i < 2 ? "1px solid var(--border)" : "none",
                        }}
                    >
                        <span className="text-[9px] text-muted-foreground font-body tracking-widest uppercase">
                            {c.label}
                        </span>
                        <span className="font-display font-bold text-[12px]" style={{ color: c.color }}>
                            {c.value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="w-full animate-fade-up-3">
                <PrimaryButton gradient="world">Enter the Arena →</PrimaryButton>
            </div>
        </div>
    );
}

/* =========================================================
   PROGRESS BAR
   ========================================================= */
function ProgressBar({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
    const LABELS = ["Goal", "Drive", "World", "Rank", "Profile"];
    const pct = (step / 5) * 100;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {LABELS.map((label, i) => {
                        const s = i + 1;
                        const done = step > s;
                        const active = step === s;
                        return (
                            <div key={s} className="flex items-center gap-1.5">
                                <div className="flex flex-col items-center gap-0.5">
                                    <div
                                        className="flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 w-[22px] h-[22px]"
                                        style={{
                                            background: done
                                                ? "linear-gradient(135deg,#8A5CF5,#03E4FF)"
                                                : active
                                                  ? "color-mix(in srgb, var(--primary) 20%, transparent)"
                                                  : "color-mix(in srgb, var(--border) 80%, transparent)",
                                            border:
                                                done || active
                                                    ? "1.5px solid color-mix(in srgb, var(--primary) 65%, transparent)"
                                                    : "1.5px solid color-mix(in srgb, var(--border) 90%, transparent)",
                                            color: done
                                                ? "var(--primary-foreground)"
                                                : active
                                                  ? "var(--primary)"
                                                  : "var(--muted-foreground)",
                                            boxShadow: active
                                                ? "0 0 10px color-mix(in srgb, var(--primary) 40%, transparent)"
                                                : "none",
                                        }}
                                    >
                                        {done ? (
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path
                                                    d="M2 5l2 2 4-4"
                                                    stroke="var(--primary-foreground)"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ) : (
                                            s
                                        )}
                                    </div>
                                    <span
                                        className="text-[8px] font-body hidden sm:block"
                                        style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
                                    >
                                        {label}
                                    </span>
                                </div>
                                {s < 5 && (
                                    <div
                                        className="h-px w-5 sm:w-8 transition-all duration-500"
                                        style={{
                                            background: done
                                                ? "linear-gradient(90deg,#8A5CF5,#03E4FF)"
                                                : "color-mix(in srgb, var(--border) 90%, transparent)",
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
                <span className="text-[11px] text-muted-foreground font-body">{step}/5</span>
            </div>
            <div className="relative w-full h-0.5 rounded-full bg-secondary overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg,#8A5CF5,#03E4FF)",
                        boxShadow: "0 0 8px color-mix(in srgb, var(--primary) 50%, transparent)",
                    }}
                />
            </div>
        </div>
    );
}

/* =========================================================
   LAYOUT SHELL
   ========================================================= */
function OnboardingShell({
    children,
    step,
    screen,
    onSwitchToLogin,
    onSwitchToSignup,
}: {
    children: React.ReactNode;
    step: Step;
    screen: Screen;
    onSwitchToLogin: () => void;
    onSwitchToSignup: () => void;
}) {
    const isWide = screen === "onboarding" && step === 3;

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-background">
            <div
                className="animate-orb pointer-events-none absolute top-[28%] left-1/2 w-[700px] h-[700px] rounded-full"
                style={{
                    transform: "translate(-50%,-50%)",
                    background:
                        "radial-gradient(ellipse at center, color-mix(in srgb, var(--primary) 16%, transparent) 0%, color-mix(in srgb, var(--primary) 4%, transparent) 45%, transparent 70%)",
                }}
            />
            <div
                className="pointer-events-none absolute bottom-[8%] right-[12%] w-[320px] h-[320px] rounded-full"
                style={{
                    background:
                        "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 6%, transparent) 0%, transparent 65%)",
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.022]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "repeat",
                    backgroundSize: "128px",
                }}
            />

            <div className="relative w-full z-10" style={{ maxWidth: isWide ? 820 : 480 }}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
                            style={{
                                background:
                                    "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 90%, transparent), color-mix(in srgb, var(--card) 90%, transparent))",
                                border: "1.5px solid color-mix(in srgb, var(--primary) 35%, transparent)",
                                boxShadow: "0 0 12px color-mix(in srgb, var(--primary) 12%, transparent)",
                            }}
                        >
                            <svg width="13" height="15" viewBox="0 0 16 18" fill="none">
                                <path
                                    d="M13 5.5C13 4 11.5 3 9 3C6.5 3 4.5 4.2 4.5 6C4.5 7.8 6.5 8.5 8.5 9C10.5 9.5 13 10.5 13 12.5C13 14.5 11 15.5 8.5 15.5C6 15.5 3.5 14.2 3 12.5"
                                    stroke="url(#sG)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient
                                        id="sG"
                                        x1="3"
                                        y1="3"
                                        x2="13"
                                        y2="15"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#8A5CF5" />
                                        <stop offset="1" stopColor="#03E4FF" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className="font-display font-bold text-[13px] tracking-[-0.02em] text-foreground/75">
                            ShonenBuilds
                        </span>
                    </div>
                    {screen === "onboarding" ? (
                        <button
                            onClick={onSwitchToLogin}
                            className="text-[12px] text-muted-foreground font-body hover:text-foreground transition-colors"
                        >
                            Already have an account?
                        </button>
                    ) : (
                        <button
                            onClick={onSwitchToSignup}
                            className="text-[12px] text-muted-foreground font-body hover:text-foreground transition-colors"
                        >
                            New warrior →
                        </button>
                    )}
                </div>

                {screen === "onboarding" && step >= 1 && step <= 5 && (
                    <div className="mb-5">
                        <ProgressBar step={step as 1 | 2 | 3 | 4 | 5} />
                    </div>
                )}

                <div
                    className="rounded-2xl p-6 sm:p-8 bg-card/85 backdrop-blur-2xl border border-border"
                    style={{
                        boxShadow:
                            "0 0 0 1px color-mix(in srgb, var(--primary) 5%, transparent), 0 24px 80px rgba(0,0,0,0.35)",
                    }}
                >
                    {children}
                </div>

                <p className="text-center text-[10px] text-muted-foreground font-body mt-3">
                    By continuing you agree to our{" "}
                    <span className="text-primary/60 cursor-pointer hover:text-primary transition-colors">Terms</span> &{" "}
                    <span className="text-primary/60 cursor-pointer hover:text-primary transition-colors">
                        Privacy Policy
                    </span>
                    . © 2026 ShonenBuilds.
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   LOGIN SCREEN
   ========================================================= */
function LoginScreen({ onSwitch }: { onSwitch: () => void }) {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!identifier || !password) return;

        setLoading(true);
        setError(null);

        try {
            const fingerprint = await getFingerprint();

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: identifier, password, fingerprint }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                setLoading(false);
                return;
            }

            console.log("Logged in:", data.user);
            setLoading(false);
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error. Try again.");
            setLoading(false);
        }
    };

    const EyeIcon = ({ open }: { open: boolean }) =>
        open ? (
            <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
        ) : (
            <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-center animate-fade-up-1">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                        background:
                            "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 90%, transparent), color-mix(in srgb, var(--card) 90%, transparent))",
                        border: "1.5px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                        boxShadow: "0 0 20px color-mix(in srgb, var(--primary) 18%, transparent)",
                    }}
                >
                    <svg width="20" height="22" viewBox="0 0 16 18" fill="none">
                        <path
                            d="M13 5.5C13 4 11.5 3 9 3C6.5 3 4.5 4.2 4.5 6C4.5 7.8 6.5 8.5 8.5 9C10.5 9.5 13 10.5 13 12.5C13 14.5 11 15.5 8.5 15.5C6 15.5 3.5 14.2 3 12.5"
                            stroke="url(#lG)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="lG" x1="3" y1="3" x2="13" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#8A5CF5" />
                                <stop offset="1" stopColor="#03E4FF" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div>
                    <h2 className="font-display font-bold text-[clamp(22px,4vw,30px)] tracking-[-0.03em] text-foreground">
                        Welcome back,{" "}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            warrior.
                        </span>
                    </h2>
                    <p className="text-[13px] text-muted-foreground font-body mt-1">
                        Continue your ascent where you left off.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 animate-fade-up-2">
                <Input
                    label="Email or Username"
                    value={identifier}
                    onChange={setIdentifier}
                    placeholder="uzumaki_naruto"
                    autoFocus
                />
                <Input
                    label="Password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    suffix={
                        <button
                            type="button"
                            onClick={() => setShowPwd((p) => !p)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <EyeIcon open={showPwd} />
                        </button>
                    }
                />
                <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground font-body">Remember device</span>
                    <button className="text-[12px] text-primary font-body hover:text-accent transition-colors">
                        Forgot password?
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-[12px] text-destructive font-body text-center animate-fade-up-3">{error}</div>
            )}

            <div className="flex flex-col gap-3 animate-fade-up-3">
                <PrimaryButton onClick={handleLogin} disabled={!identifier || !password || loading} gradient="violet">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeOpacity="0.3"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M12 2a10 10 0 0 1 10 10"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            </svg>
                            Authenticating…
                        </span>
                    ) : (
                        "Enter the Arena ✦"
                    )}
                </PrimaryButton>
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground font-body">OR</span>
                    <div className="flex-1 h-px bg-border" />
                </div>
                <button
                    onClick={onSwitch}
                    className="w-full rounded-xl py-3 text-[13px] font-medium font-body border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all duration-200"
                >
                    Create a new warrior account →
                </button>
            </div>
        </div>
    );
}

/* =========================================================
   APP ROOT
   ========================================================= */
export default function App() {
    const [screen, setScreen] = useState<Screen>("onboarding");
    const [step, setStep] = useState<Step>(0);
    const [formData, setFormData] = useState<FormData>({
        goal: "",
        why: "",
        world: "",
        fullName: "",
        username: "",
        email: "",
        password: "",
    });

    const update = (partial: Partial<FormData>) => setFormData((p) => ({ ...p, ...partial }));
    const next = () => setStep((s) => (s + 1) as Step);

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const tryingToLogin = urlParams.get("login");
        if (tryingToLogin === "true") {
            setScreen("login");
            return;
        }
        setScreen("onboarding");
    }, []);

    return (
        <>
            <button
                onClick={() => setScreen(screen === "onboarding" ? "login" : "onboarding")}
                className="bg-secondary fixed text-primary/80 hover:text-foreground/50 border-primary/20 py-1 px-4 rounded-lg bottom-10 right-10 z-30 border-[1.5px] hover:border-foreground/50 hover:cursor-pointer font-sans  transition-all duration-150 ease-in-out"
            >
                {screen === "login" ? "Create" : "Login"}
            </button>
            <OnboardingShell
                step={step}
                screen={screen}
                onSwitchToLogin={() => {
                    setScreen("login");
                }}
                onSwitchToSignup={() => {
                    setScreen("onboarding");
                    setStep(0);
                }}
            >
                {screen === "login" ? (
                    <LoginScreen
                        onSwitch={() => {
                            setScreen("onboarding");
                            setStep(0);
                        }}
                    />
                ) : step === 0 ? (
                    <StepTeaser key="s0" onBegin={next} />
                ) : step === 1 ? (
                    <StepGoal key="s1" data={formData} setData={update} onNext={next} />
                ) : step === 2 ? (
                    <StepWhy key="s2" data={formData} setData={update} onNext={next} />
                ) : step === 3 ? (
                    <StepWorldSelection key="s3" data={formData} setData={update} onNext={next} />
                ) : step === 4 ? (
                    <StepRankReveal key="s4" data={formData} onNext={next} />
                ) : step === 5 ? (
                    <StepIdentityCredentials key="s5" data={formData} setData={update} onNext={next} />
                ) : (
                    <StepComplete key="s6" data={formData} />
                )}
            </OnboardingShell>
        </>
    );
}
