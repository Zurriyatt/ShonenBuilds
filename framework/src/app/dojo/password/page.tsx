"use client";

import { useMemo, useState, type FormEvent, type ReactNode , useEffect} from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/UserProvider";
import { getWorld } from "@/lib/world/MPS";
import toast from "react-hot-toast";
/*
 * /dojo/password — Change Password ("Reforge your Seal")
 *
 * LAYOUT
 * Mobile (< lg): single column — heading → form sections → inline seal meter → tips.
 * Desktop (≥ lg): form left (7 cols), sticky "Seal Analysis" HUD right (5 cols). Max width 1120px.
 */

/* =========================================================
   PLACEHOLDERS (wire to real auth/settings)
   ========================================================= */ 
const LAST_CHANGED = "3 months ago"; // TODO: derive from user.passwordChangedAt

async function changePassword(payload: { currentPassword: string; newPassword: string; signOutOthers: boolean }) {
    // TODO: replace with your real endpoint, e.g.
    const res = await fetch("/api/auth/password", {
          method: "POST",
       headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
     })
    const jsonMess = await res.json();
    if(!jsonMess.success){ 
        toast.error("Failed to update password!");
        return;
    }       
    toast.success(jsonMess.message);
    setTimeout(() =>{window.location.reload()}, 2000)
}

/* =========================================================
   SEAL ANALYSIS (strength scoring)
   ========================================================= */
const COMMON = ["password", "123456", "qwerty", "letmein", "admin", "welcome", "iloveyou", "abc123", "111111", "000000", "dragon", "monkey"];

const TIERS = [
    { rank: "—", name: "Unsealed", color: "var(--muted-foreground)", blurb: "Start typing to forge your new seal." },
    { rank: "E", name: "Fragile Seal", color: "var(--destructive)", blurb: "Even a rookie could break this. Keep training." },
    { rank: "D", name: "Cracked Seal", color: "color-mix(in srgb, var(--destructive) 55%, var(--gold))", blurb: "Holds against the weak. Add variety." },
    { rank: "C", name: "Iron Seal", color: "var(--gold)", blurb: "Solid foundation. Mix in symbols or length." },
    { rank: "B", name: "Steel Seal", color: "color-mix(in srgb, var(--gold) 50%, var(--accent))", blurb: "Battle-ready. A few more characters to ascend." },
    { rank: "A", name: "Mythril Seal", color: "var(--accent)", blurb: "Elite-tier protection. Nearly unbreakable." },
    { rank: "S", name: "Sovereign Seal", color: "var(--primary)", blurb: "Unbreakable. A seal worthy of a monarch." },
];

function analyze(pw: string, current: string, username?: string) {
    const lower = /[a-z]/.test(pw);
    const upper = /[A-Z]/.test(pw);
    const digit = /\d/.test(pw);
    const symbol = /[^A-Za-z0-9]/.test(pw);
    const lc = pw.toLowerCase();
    const weak =
        pw.length > 0 &&
        (COMMON.some((c) => lc.includes(c)) ||
            (!!username && username.length >= 3 && lc.includes(username.toLowerCase())) ||
            /(.)\1{3,}/.test(pw));

    const checks = [
        { id: "len", label: "At least 8 characters", ok: pw.length >= 8, required: true },
        { id: "case", label: "Upper & lowercase letters", ok: lower && upper, required: true },
        { id: "digit", label: "At least one number", ok: digit, required: true },
        { id: "diff", label: "Different from current password", ok: pw.length > 0 && pw !== current, required: true },
        { id: "symbol", label: "A symbol  ! @ # $ %", ok: symbol, required: false },
        { id: "long", label: "12 or more characters", ok: pw.length >= 12, required: false },
    ];

    let score = 0;
    if (pw.length) {
        score = Math.max(1, [pw.length >= 8, pw.length >= 12, pw.length >= 16, lower && upper, digit, symbol].filter(Boolean).length);
        if (weak) score = 1;
    }

    const pool = (lower ? 26 : 0) + (upper ? 26 : 0) + (digit ? 10 : 0) + (symbol ? 33 : 0);
    const bits = pw.length && pool ? pw.length * Math.log2(pool) : 0;
    const remaining = checks.filter((c) => c.required && !c.ok).length;

    return { checks, score, weak, bits, valid: remaining === 0, remaining };
}

function crackTime(bits: number) {
    if (!bits) return "—";
    const s = Math.pow(2, bits) / 2 / 1e10; // ~10B guesses/sec offline attack
    if (s < 1) return "Instantly";
    if (s < 60) return `${Math.round(s)} sec`;
    if (s < 3600) return `${Math.round(s / 60)} min`;
    if (s < 86400) return `${Math.round(s / 3600)} hrs`;
    const d = s / 86400;
    if (d < 365) return `${Math.round(d)} days`;
    const y = d / 365;
    if (y < 1000) return `${Math.round(y)} yrs`;
    if (y < 1e6) return `${Math.round(y / 1000)}k yrs`;
    return "Eons";
}

function generatePassword(length = 18) {
    const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%^&*-_=+?"];
    const all = sets.join("");
    const rand = (n: number) => {
        const a = new Uint32Array(1);
        crypto.getRandomValues(a);
        return a[0] % n;
    };
    const chars = sets.map((s) => s[rand(s.length)]);
    while (chars.length < length) chars.push(all[rand(all.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
        const j = rand(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
}

/* =========================================================
   ICONS
   ========================================================= */
const ICONS = {
    lock: (
        <>
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </>
    ),
    key: (
        <>
            <circle cx="8" cy="15" r="4" />
            <path d="M10.8 12.2L20 3M16.5 6.5l3 3M14.5 8.5l2 2" />
        </>
    ),
    eye: (
        <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    eyeOff: (
        <>
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-2.16 3.19" />
            <path d="M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24M2 2l20 20" />
        </>
    ),
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    x: <path d="M7 7l10 10M17 7L7 17" />,
    shield: (
        <>
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
            <path d="M8.5 12l2.5 2.5 4.5-5" />
        </>
    ),
    spark: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />,
    copy: (
        <>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </>
    ),
    alert: (
        <>
            <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4M12 17h.01" />
        </>
    ),
    caps: <path d="M12 4l7 8h-4v4H9v-4H5l7-8zM9 20h6" />,
    devices: (
        <>
            <rect x="2" y="4" width="14" height="10" rx="1.5" />
            <path d="M6 18h6M9 14v4" />
            <rect x="17" y="8" width="5" height="12" rx="1.2" />
        </>
    ),
};

function Icon({ name, size = 16, className, strokeWidth = 1.8 }: { name: keyof typeof ICONS; size?: number; className?: string; strokeWidth?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
        >
            {ICONS[name]}
        </svg>
    );
}

/* =========================================================
   PRIMITIVES
   ========================================================= */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            type="button"
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

function Section({ index, title, kicker, children, className }: { index: number; title: string; kicker?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`flex flex-col gap-2.5 ${className ?? ""}`}>
            <div className="flex items-center gap-2.5 px-1">
                <span className="font-display font-bold text-[10px] tabular-nums text-primary">{String(index).padStart(2, "0")}</span>
                <span className="text-[10px] font-body font-bold tracking-[0.22em] uppercase text-foreground/55">{title}</span>
                <div className="flex-1 h-px bg-border" />
                {kicker}
            </div>
            <div className="rounded-[18px] p-4 lg:p-5 bg-card border border-border">{children}</div>
        </section>
    );
}

type FieldStatus = "idle" | "ok" | "error";

function PasswordField({
    id,
    label,
    value,
    onChange,
    autoComplete,
    placeholder,
    status = "idle",
    message,
    labelAction,
    reveal,
    onRevealChange,
    autoFocus,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    autoComplete: string;
    placeholder?: string;
    status?: FieldStatus;
    message?: string;
    labelAction?: ReactNode;
    reveal?: boolean;
    onRevealChange?: (v: boolean) => void;
    autoFocus?: boolean;
}) {
    const [localShow, setLocalShow] = useState(false);
    const show = reveal ?? localShow;
    const setShow = onRevealChange ?? setLocalShow;
    const [caps, setCaps] = useState(false);

    const tone = status === "error" ? "var(--destructive)" : status === "ok" ? "var(--accent)" : null;
    const msgId = `${id}-msg`;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 min-h-[20px]">
                <label htmlFor={id} className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    {label}
                </label>
                {labelAction}
            </div>

            <div
                className="group relative flex items-center rounded-xl border border-border bg-secondary transition-all duration-200 focus-within:border-primary/70 focus-within:shadow-[0_0_0_3px_var(--violet-dim),0_0_28px_-8px_var(--violet-glow)]"
                style={tone ? { borderColor: `color-mix(in srgb, ${tone} 60%, transparent)` } : undefined}
            >
                <span
                    className="pointer-events-none absolute left-3.5 transition-colors text-muted-foreground group-focus-within:text-primary"
                    style={tone ? { color: tone } : undefined}
                >
                    <Icon name={id === "current" ? "key" : "lock"} size={16} />
                </span>

                <input
                    id={id}
                    name={id}
                    type={show ? "text" : "password"}
                    value={value}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    spellCheck={false}
                    autoCapitalize="off"
                    aria-invalid={status === "error"}
                    aria-describedby={message ? msgId : undefined}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => setCaps(e.getModifierState("CapsLock"))}
                    onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))}
                    onBlur={() => setCaps(false)}
                    className="flex-1 min-w-0 h-12 bg-transparent pl-11 pr-2 font-body text-[16px] lg:text-[15px] text-foreground placeholder:text-muted-foreground/45 outline-none focus-visible:outline-none tracking-[0.02em]"
                />

                {caps && (
                    <span
                        className="mr-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-body font-bold tracking-[0.14em] uppercase"
                        style={{ color: "var(--gold)", background: "color-mix(in srgb, var(--gold) 12%, transparent)" }}
                        title="Caps Lock is on"
                    >
                        <Icon name="caps" size={11} strokeWidth={2} />
                        Caps
                    </span>
                )}

                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    aria-pressed={show}
                    className="mr-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-background/40 hover:cursor-pointer active:scale-95"
                >
                    <Icon name={show ? "eyeOff" : "eye"} size={16} />
                </button>
            </div>

            {message && (
                <p
                    id={msgId}
                    role={status === "error" ? "alert" : undefined}
                    className="flex items-center gap-1.5 px-0.5 text-[12px] font-body"
                    style={{ color: tone ?? "var(--muted-foreground)" }}
                >
                    {status !== "idle" && <Icon name={status === "ok" ? "check" : "x"} size={12} strokeWidth={2.4} />}
                    {message}
                </p>
            )}
        </div>
    );
}

function SealMeter({ score, color }: { score: number; color: string }) {
    return (
        <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={6} aria-valuenow={score}>
            {Array.from({ length: 6 }).map((_, i) => {
                const on = i < score;
                return (
                    <span
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all duration-500"
                        style={{
                            background: on ? color : "var(--secondary)",
                            boxShadow: on ? `0 0 10px color-mix(in srgb, ${color} 55%, transparent)` : "inset 0 1px 1px rgba(0,0,0,0.35)",
                            transitionDelay: `${i * 40}ms`,
                        }}
                    />
                );
            })}
        </div>
    );
}

function Checklist({ checks }: { checks: ReturnType<typeof analyze>["checks"] }) {
    return (
        <ul className="flex flex-col gap-2">
            {checks.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5">
                    <span
                        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-300"
                        style={{
                            background: c.ok ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "transparent",
                            border: `1px solid ${c.ok ? "color-mix(in srgb, var(--accent) 55%, transparent)" : "var(--border)"}`,
                            color: "var(--accent)",
                            boxShadow: c.ok ? "0 0 10px color-mix(in srgb, var(--accent) 30%, transparent)" : "none",
                        }}
                    >
                        {c.ok && <Icon name="check" size={10} strokeWidth={3} />}
                    </span>
                    <span className={`flex-1 font-body text-[12.5px] transition-colors ${c.ok ? "text-foreground" : "text-muted-foreground"}`}>{c.label}</span>
                    {!c.required && (
                        <span
                            className="rounded px-1.5 py-0.5 text-[8.5px] font-body font-bold tracking-[0.16em] uppercase"
                            style={{ color: "var(--gold)", background: "color-mix(in srgb, var(--gold) 10%, transparent)" }}
                        >
                            Bonus
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

/* HUD corner brackets — Solo Leveling system-window feel */
function Corners({ color }: { color: string }) {
    const base = "pointer-events-none absolute h-3.5 w-3.5";
    const s = { borderColor: color };
    return (
        <>
            <span className={`${base} left-2 top-2 border-l-2 border-t-2 rounded-tl-md`} style={s} />
            <span className={`${base} right-2 top-2 border-r-2 border-t-2 rounded-tr-md`} style={s} />
            <span className={`${base} left-2 bottom-2 border-l-2 border-b-2 rounded-bl-md`} style={s} />
            <span className={`${base} right-2 bottom-2 border-r-2 border-b-2 rounded-br-md`} style={s} />
        </>
    );
}

/* =========================================================
   PAGE
   ========================================================= */
export default function DojoPassword() {
    const router = useRouter();
    const USER_DATA = useUser();
    const user = USER_DATA.user;
    const world = getWorld(user?.world as string);

    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [signOutOthers, setSignOutOthers] = useState(true);
    const [generated, setGenerated] = useState(false);
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
    const [error, setError] = useState<string | null>(null);

    const a = useMemo(() => analyze(next, current, user?.username as string | undefined), [next, current, user?.username]);
    const tier = TIERS[a.score];
    const tierColor = a.score === 6 ? world.color : tier.color;

    const matches = confirm.length > 0 && confirm === next;
    const confirmStatus: FieldStatus = !confirm ? "idle" : matches ? "ok" : next.startsWith(confirm) ? "idle" : "error";
    const confirmMsg = !confirm ? undefined : matches ? "Seals match" : next.startsWith(confirm) ? undefined : "Passwords don't match";

    const canSubmit = current.length > 0 && a.valid && matches && status !== "submitting";
    const remaining = (current ? 0 : 1) + a.remaining + (matches ? 0 : 1);

    const onGenerate = () => {
        const pw = generatePassword();
        setNext(pw);
        setConfirm(pw);
        setShowNew(true);
        setGenerated(true);
        setCopied(false);
    };

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(next);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard unavailable — field is already revealed for manual copy */
        }
    };
    useEffect(() => {
        if(!USER_DATA.user?.name){
            router.replace('/auth?login=true');
        };
    }, [USER_DATA])
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setStatus("submitting");
        setError(null);
        try {
            await changePassword({ currentPassword: current, newPassword: next, signOutOthers });
            setStatus("success");
        } catch (err) {
            setStatus("idle");
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
    };

    /* ── Seal Analysis HUD (desktop sidebar) ── */
    const hud = (
        <div
            className="relative overflow-hidden rounded-[20px] p-6"
            style={{
                background: `linear-gradient(165deg, color-mix(in srgb, ${tierColor} 9%, var(--card)) 0%, var(--card) 60%)`,
                border: `1px solid color-mix(in srgb, ${tierColor} 30%, var(--border))`,
                boxShadow: a.score ? `0 0 40px -14px ${tierColor}` : "none",
                transition: "background 0.5s, border-color 0.5s, box-shadow 0.5s",
            }}
        >
            <Corners color={`color-mix(in srgb, ${tierColor} 70%, transparent)`} />
            <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-colors duration-500"
                style={{ background: tierColor, opacity: a.score ? 0.16 : 0.05 }}
            />

            <div className="relative flex items-center justify-between">
                <span className="text-[9px] font-body font-bold tracking-[0.26em] uppercase text-muted-foreground">Seal Analysis</span>
                <span className="flex items-center gap-1.5 text-[9px] font-body font-bold tracking-[0.2em] uppercase text-accent">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    Live
                </span>
            </div>

            {/* Rank emblem */}
            <div className="relative mt-6 flex items-center gap-5">
                <div className="relative flex h-[84px] w-[84px] shrink-0 items-center justify-center">
                    <div
                        className="absolute inset-[10px] rotate-45 rounded-[14px] transition-all duration-500"
                        style={{
                            border: `1.5px solid ${tierColor}`,
                            background: `color-mix(in srgb, ${tierColor} 10%, transparent)`,
                            boxShadow: a.score ? `0 0 24px -4px ${tierColor}, inset 0 0 18px -6px ${tierColor}` : "none",
                        }}
                    />
                    <div className="absolute inset-0 rotate-45 rounded-[18px] border border-dashed opacity-30" style={{ borderColor: tierColor }} />
                    <span
                        key={tier.rank}
                        className="relative font-display font-extrabold text-[34px] leading-none fade-up-1"
                        style={{ color: tierColor, textShadow: a.score ? `0 0 18px ${tierColor}` : "none", animationDelay: "0s", animationDuration: "0.35s" }}
                    >
                        {tier.rank}
                    </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-[9px] font-body font-bold tracking-[0.22em] uppercase text-muted-foreground/70">
                        {a.score ? `${tier.rank}-Rank` : "Awaiting input"}
                    </span>
                    <span className="font-display font-bold text-[20px] leading-tight tracking-[-0.02em] transition-colors" style={{ color: a.score ? tierColor : "var(--foreground)" }}>
                        {tier.name}
                    </span>
                    <span className="font-body text-[12px] leading-snug text-muted-foreground">{tier.blurb}</span>
                </div>
            </div>

            <div className="relative mt-6">
                <SealMeter score={a.score} color={tierColor} />
                <div className="mt-2 flex justify-between text-[9px] font-display font-bold tracking-[0.2em] text-muted-foreground/50">
                    {["E", "D", "C", "B", "A", "S"].map((r, i) => (
                        <span key={r} style={{ color: i < a.score ? tierColor : undefined }}>
                            {r}
                        </span>
                    ))}
                </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-background/40">
                <div className="flex flex-col gap-1 border-r border-border p-3">
                    <span className="text-[9px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground/70">Entropy</span>
                    <span className="font-display font-bold text-[16px] tabular-nums text-foreground">
                        {Math.round(a.bits)}
                        <span className="ml-1 font-body text-[11px] font-medium text-muted-foreground">bits</span>
                    </span>
                </div>
                <div className="flex flex-col gap-1 p-3">
                    <span className="text-[9px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground/70">Time to break</span>
                    <span className="font-display font-bold text-[16px] tabular-nums" style={{ color: a.score >= 5 ? tierColor : "var(--foreground)" }}>
                        {crackTime(a.bits)}
                    </span>
                </div>
            </div>

            {a.weak && (
                <p
                    className="relative mt-4 flex items-start gap-2 rounded-xl p-3 text-[12px] font-body leading-snug"
                    style={{ color: "var(--destructive)", background: "color-mix(in srgb, var(--destructive) 10%, transparent)" }}
                >
                    <Icon name="alert" size={14} className="mt-px shrink-0" />
                    Contains a common pattern or your username. Seal capped at E-Rank.
                </p>
            )}

            <div className="relative my-5 h-px bg-border" />
            <span className="relative mb-3 block text-[9px] font-body font-bold tracking-[0.26em] uppercase text-muted-foreground">Requirements</span>
            <div className="relative">
                <Checklist checks={a.checks} />
            </div>
        </div>
    );

    const tips = (
        <div className="rounded-[18px] border border-border bg-card p-5">
            <div className="mb-3.5 flex items-center gap-2">
                <span className="text-gold">
                    <Icon name="shield" size={15} />
                </span>
                <span className="text-[10px] font-body font-bold tracking-[0.22em] uppercase text-foreground/70">The Master's Code</span>
            </div>
            <ol className="flex flex-col gap-3">
                {[
                    ["Use a passphrase", "Four unrelated words beat one clever word. Length is power."],
                    ["Never reuse a seal", "One leaked site shouldn't open every gate you own."],
                    ["Let a vault remember", "A password manager keeps every seal unique without memorizing."],
                ].map(([t, d], i) => (
                    <li key={t} className="flex gap-3">
                        <span className="font-display font-bold text-[11px] tabular-nums text-gold/80 pt-px">{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-body text-[13px] font-semibold text-foreground">{t}</span>
                            <span className="font-body text-[12px] leading-snug text-muted-foreground">{d}</span>
                        </div>
                    </li>
                ))}
            </ol>
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
                    type="button"
                    onClick={() => router.push("/dojo")}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95 hover:cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[12px] font-body">Dojo</span>
                </button>
                <span className="font-display font-bold text-[13px] lg:text-[14px] tracking-[0.12em] lg:tracking-[0.2em] text-foreground/70 uppercase">
                    Password
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground">
                    <Icon name="lock" size={16} />
                </div>
            </div>

            {!user ? (
                <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground font-body">Loading...</div>
            ) : status === "success" ? (
                /* ═════════════ SUCCESS ═════════════ */
                <div className="flex min-h-[calc(100vh-52px)] items-center justify-center px-4 py-10">
                    <div
                        className="relative w-full max-w-[460px] overflow-hidden rounded-[24px] p-7 lg:p-9 text-center fade-up-1"
                        style={{
                            background: `linear-gradient(170deg, color-mix(in srgb, ${world.color} 12%, var(--card)) 0%, var(--card) 60%)`,
                            border: `1px solid ${world.border}`,
                            boxShadow: `0 0 60px -16px ${world.glow}`,
                        }}
                    >
                        <Corners color={world.border} />
                        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: world.glow, opacity: 0.5 }} />

                        <div className="relative mx-auto flex h-[96px] w-[96px] items-center justify-center">
                            <div
                                className="absolute inset-0 rounded-full animate-spin"
                                style={{
                                    animationDuration: "6s",
                                    background: `conic-gradient(${world.color} 0deg, var(--accent) 140deg, transparent 220deg, ${world.color} 360deg)`,
                                    filter: `drop-shadow(0 0 12px ${world.glow})`,
                                    WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                                    mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                                }}
                            />
                            <div
                                className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
                                style={{ background: `color-mix(in srgb, ${world.color} 16%, var(--card))`, color: world.color }}
                            >
                                <Icon name="shield" size={32} strokeWidth={1.7} />
                            </div>
                        </div>

                        <span className="relative mt-6 block text-[10px] font-body font-bold tracking-[0.28em] uppercase" style={{ color: world.color }}>
                            Seal Reforged
                        </span>
                        <h1 className="relative mt-2 font-display font-bold text-[28px] leading-none tracking-[-0.03em] text-foreground">Password updated</h1>
                        <p className="relative mx-auto mt-3 max-w-[340px] font-body text-[13.5px] leading-relaxed text-muted-foreground">
                            Your new seal is active. Your streaks, ranks, and XP remain guarded.
                            {signOutOthers && " Every other device has been signed out."}
                        </p>

                        <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
                            <span
                                className="rounded-full px-3 py-1 text-[11px] font-body font-bold"
                                style={{ color: tierColor, background: `color-mix(in srgb, ${tierColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${tierColor} 35%, transparent)` }}
                            >
                                {tier.rank}-Rank · {tier.name}
                            </span>
                            <span className="rounded-full border border-border px-3 py-1 text-[11px] font-body font-semibold text-muted-foreground">
                                {world.icon} {world.display}
                            </span>
                        </div>

                        <div className="relative mt-7 flex flex-col gap-2.5 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => router.push("/dojo")}
                                className="flex-1 rounded-xl px-5 py-3 text-[13px] font-body font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] hover:cursor-pointer"
                                style={{
                                    background: "linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 65%, var(--accent)) 100%)",
                                    boxShadow: "0 0 24px -4px var(--violet-glow), inset 0 1px 0 rgba(255,255,255,0.18)",
                                }}
                            >
                                Back to Dojo
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/realm")}
                                className="flex-1 rounded-xl border border-border px-5 py-3 text-[13px] font-body font-semibold text-foreground/80 transition-colors hover:text-foreground hover:border-primary/40 hover:cursor-pointer"
                            >
                                Enter the Realm
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-[1120px] flex-col lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 lg:px-8 lg:py-10">
                    {/* ═════════════ FORM ═════════════ */}
                    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7 px-4 pt-6 pb-12 lg:col-span-7 lg:px-0 lg:pt-0">
                        {/* Heading */}
                        <div className="flex flex-col gap-1 fade-up-1">
                            <span className="text-[10px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                                Dojo · Security · {world.display}
                            </span>
                            <h1 className="font-display font-bold text-[28px] lg:text-[34px] leading-none tracking-[-0.03em] text-foreground">
                                Reforge your seal
                            </h1>
                            <p className="mt-1.5 max-w-[460px] font-body text-[13px] leading-relaxed text-muted-foreground">
                                Change the password that guards your progress. A stronger seal keeps your streaks, ranks, and XP out of enemy hands.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-body font-medium text-muted-foreground">
                                    <Icon name="shield" size={12} className="text-accent" />
                                    Last changed {LAST_CHANGED}
                                </span>
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-body font-semibold"
                                    style={{ color: world.color, background: `color-mix(in srgb, ${world.color} 10%, transparent)`, border: `1px solid ${world.border}` }}
                                >
                                    {world.icon} @{user.username}
                                </span>
                            </div>
                        </div>

                        {/* 01 — Verify */}
                        <Section index={1} title="Verify Identity" className="fade-up-2">
                            <PasswordField
                                id="current"
                                label="Current password"
                                value={current}
                                onChange={(v) => {
                                    setCurrent(v);
                                    setError(null);
                                }}
                                autoComplete="current-password"
                                placeholder="Enter your current password"
                                status={error ? "error" : "idle"}
                                autoFocus
                                labelAction={
                                    <button
                                        type="button"
                                        onClick={() => router.push("/forgot-password")}
                                        className="text-[11px] font-body font-semibold text-muted-foreground transition-colors hover:text-primary hover:cursor-pointer"
                                    >
                                        Forgot it?
                                    </button>
                                }
                            />
                        </Section>

                        {/* 02 — Forge */}
                        <Section index={2} title="Forge New Seal" className="fade-up-3">
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-3">
                                    <PasswordField
                                        id="new"
                                        label="New password"
                                        value={next}
                                        onChange={(v) => {
                                            setNext(v);
                                            setGenerated(false);
                                        }}
                                        autoComplete="new-password"
                                        placeholder="Create a strong password"
                                        reveal={showNew}
                                        onRevealChange={setShowNew}
                                        labelAction={
                                            <button
                                                type="button"
                                                onClick={onGenerate}
                                                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-body font-bold text-accent transition-all hover:bg-accent/10 hover:cursor-pointer active:scale-95"
                                            >
                                                <Icon name="spark" size={12} strokeWidth={1.6} />
                                                Generate
                                            </button>
                                        }
                                    />

                                    {generated && (
                                        <div
                                            className="flex items-center gap-3 rounded-xl p-3 fade-up-1"
                                            style={{
                                                animationDelay: "0s",
                                                animationDuration: "0.4s",
                                                background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                                                border: "1px solid color-mix(in srgb, var(--accent) 28%, transparent)",
                                            }}
                                        >
                                            <span className="text-accent shrink-0">
                                                <Icon name="spark" size={16} strokeWidth={1.6} />
                                            </span>
                                            <p className="flex-1 font-body text-[12px] leading-snug text-foreground/80">
                                                S-Rank seal generated and filled in. Save it to your password manager.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={onCopy}
                                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-body font-bold transition-all hover:cursor-pointer active:scale-95"
                                                style={{
                                                    color: copied ? "var(--accent-foreground)" : "var(--accent)",
                                                    background: copied ? "var(--accent)" : "transparent",
                                                    borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
                                                }}
                                            >
                                                <Icon name={copied ? "check" : "copy"} size={12} strokeWidth={2.2} />
                                                {copied ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                    )}

                                    {/* Inline seal meter — mobile / tablet only (desktop uses HUD) */}
                                    <div className="flex flex-col gap-3 lg:hidden">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <span className="font-display font-extrabold text-[15px] leading-none" style={{ color: tierColor }}>
                                                    {tier.rank}
                                                </span>
                                                <span className="font-body text-[12px] font-semibold" style={{ color: a.score ? tierColor : "var(--muted-foreground)" }}>
                                                    {tier.name}
                                                </span>
                                            </span>
                                            <span className="font-body text-[11px] text-muted-foreground">
                                                Break time · <span className="font-semibold text-foreground/80">{crackTime(a.bits)}</span>
                                            </span>
                                        </div>
                                        <SealMeter score={a.score} color={tierColor} />
                                        {a.weak && (
                                            <p className="flex items-center gap-1.5 text-[12px] font-body text-destructive">
                                                <Icon name="alert" size={12} />
                                                Common pattern or username detected. Capped at E-Rank.
                                            </p>
                                        )}
                                        <div className="rounded-xl border border-border bg-background/40 p-3.5">
                                            <Checklist checks={a.checks} />
                                        </div>
                                    </div>
                                </div>

                                <PasswordField
                                    id="confirm"
                                    label="Confirm new password"
                                    value={confirm}
                                    onChange={setConfirm}
                                    autoComplete="new-password"
                                    placeholder="Type it once more"
                                    status={confirmStatus}
                                    message={confirmMsg}
                                />
                            </div>
                        </Section>

                        {/* 03 — Sessions */}
                        <Section index={3} title="Session Control" className="fade-up-4">
                            <div className="flex items-center gap-3.5">
                                <span
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary"
                                    style={{ background: "var(--violet-dim)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)" }}
                                >
                                    <Icon name="devices" size={18} strokeWidth={1.6} />
                                </span>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="font-body text-[14px] font-semibold text-foreground">Sign out other devices</span>
                                    <span className="font-body text-[12px] leading-snug text-muted-foreground">
                                        Recommended if you think someone else knows your password.
                                    </span>
                                </div>
                                <Toggle on={signOutOthers} onChange={setSignOutOthers} label="Sign out of all other devices" />
                            </div>
                        </Section>

                        {/* Error banner */}
                        {error && (
                            <div
                                role="alert"
                                className="flex items-start gap-2.5 rounded-xl p-3.5 text-[13px] font-body"
                                style={{
                                    color: "var(--destructive)",
                                    background: "color-mix(in srgb, var(--destructive) 10%, transparent)",
                                    border: "1px solid color-mix(in srgb, var(--destructive) 35%, transparent)",
                                }}
                            >
                                <Icon name="alert" size={16} className="mt-px shrink-0" />
                                <span className="flex-1">{error}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 fade-up-4">
                            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => router.push("/dojo")}
                                    className="rounded-xl border border-border px-5 py-3 text-[13px] font-body font-semibold text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40 hover:cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    aria-busy={status === "submitting"}
                                    className="group relative overflow-hidden rounded-xl px-6 py-3 text-[13px] font-body font-bold transition-all sm:min-w-[210px] enabled:hover:brightness-110 enabled:active:scale-[0.98] enabled:hover:cursor-pointer disabled:cursor-not-allowed"
                                    style={
                                        canSubmit || status === "submitting"
                                            ? {
                                                  color: "#fff",
                                                  background: "linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 65%, var(--accent)) 100%)",
                                                  boxShadow: "0 0 28px -6px var(--violet-glow), inset 0 1px 0 rgba(255,255,255,0.18)",
                                              }
                                            : { color: "var(--muted-foreground)", background: "var(--secondary)", border: "1px solid var(--border)" }
                                    }
                                >
                                    {canSubmit && (
                                        <span
                                            className="pointer-events-none absolute top-0 h-full w-1/3 -skew-x-12"
                                            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)", animation: "glow-slide 2.6s ease-in-out infinite" }}
                                        />
                                    )}
                                    <span className="relative flex items-center justify-center gap-2">
                                        {status === "submitting" ? (
                                            <>
                                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Reforging seal…
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="lock" size={14} strokeWidth={2} />
                                                Update password
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                            {!canSubmit && status !== "submitting" && (
                                <p className="text-center sm:text-right font-body text-[11px] text-muted-foreground/70">
                                    {remaining} {remaining === 1 ? "step" : "steps"} left before your seal can be forged
                                </p>
                            )}
                        </div>

                        {/* Tips — mobile placement */}
                        <div className="lg:hidden">{tips}</div>
                    </form>

                    {/* ═════════════ HUD (desktop) ═════════════ */}
                    <aside className="sticky top-[76px] hidden flex-col gap-5 lg:col-span-5 lg:flex fade-up-2">
                        {hud}
                        {tips}
                    </aside>
                </div>
            )}
        </>
    );
}
