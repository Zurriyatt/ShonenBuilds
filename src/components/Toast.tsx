"use client";

/* =========================================================
   TOASTS — gamified in-game notifications

   All variants share the same visual language:
     · Dark glass card with themed glow border
     · Icon container top-left or centered
     · Small uppercase micro-label
     · Bold reward number
     · Internal animations (pulse, ring, shimmer)

   React-hot-toast handles the outer enter/exit motion.
   These components handle the visual identity.
   ========================================================= */

/* ═════════════════════════════════════════════════════════
   1. XP GAIN — the common one
   ═════════════════════════════════════════════════════════ */

export interface XpToastProps {
    xp: number;
    skillName: string;
    state: "unlocked" | "in_progress" | "mastered";
}

export function XpToast({ xp, skillName, state }: XpToastProps) {
    const stateLabel =
        state === "mastered" ? "Mastered" :
        state === "in_progress" ? "In Progress" :
        "Unlocked";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 280,
                padding: "14px 18px 14px 14px",
                borderRadius: 18,
                background: "linear-gradient(135deg, color-mix(in srgb, var(--card) 96%, transparent) 0%, color-mix(in srgb, var(--gold) 6%, var(--card)) 100%)",
                border: "1.5px solid color-mix(in srgb, var(--gold) 45%, transparent)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 24px color-mix(in srgb, var(--gold) 25%, transparent), inset 0 1px 0 rgba(255,255,255,0.05)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Shimmer sweep */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "60%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                    animation: "toast-shimmer 1.8s ease-out 0.2s both",
                    pointerEvents: "none",
                }}
            />

            {/* Icon */}
            <div
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "color-mix(in srgb, var(--gold) 16%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--gold) 50%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                    boxShadow: "0 0 16px color-mix(in srgb, var(--gold) 35%, transparent), inset 0 0 12px color-mix(in srgb, var(--gold) 15%, transparent)",
                    animation: "toast-icon-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                }}
            >
                ⚡
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                <span
                    style={{
                        fontFamily: "var(--font-body), sans-serif",
                        fontWeight: 600,
                        fontSize: 17,
                        letterSpacing: "-0.02em",
                        color: "var(--gold)",
                        textShadow: "0 0 16px color-mix(in srgb, var(--gold) 45%, transparent)",
                        lineHeight: 1.1,
                    }}
                >
                    +{xp.toLocaleString()} XP
                </span>
                <span
                    style={{
                        fontFamily: "var(--font-body), sans-serif",
                        fontSize: 11,
                        color: "var(--muted-foreground)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {skillName} · <span style={{ opacity: 0.7 }}>{stateLabel}</span>
                </span>
            </div>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════
   2. MASTERY — skill just mastered
   ═════════════════════════════════════════════════════════ */

export interface MasteryToastProps {
    skillName: string;
    xp: number;
    icon?: string;
}

export function MasteryToast({ skillName, xp, icon }: MasteryToastProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                minWidth: 300,
                padding: "22px 24px 20px",
                borderRadius: 22,
                background: "linear-gradient(160deg, color-mix(in srgb, var(--gold) 14%, var(--card)) 0%, color-mix(in srgb, var(--primary) 10%, var(--card)) 60%, var(--card) 100%)",
                border: "1.5px solid color-mix(in srgb, var(--gold) 55%, transparent)",
                boxShadow: "0 16px 56px rgba(0,0,0,0.6), 0 0 40px color-mix(in srgb, var(--gold) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Expanding ring */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 60,
                    height: 60,
                    marginLeft: -30,
                    marginTop: -30,
                    borderRadius: "50%",
                    border: "1.5px solid color-mix(in srgb, var(--gold) 60%, transparent)",
                    animation: "toast-ring-expand 1.4s ease-out 0.15s both",
                    pointerEvents: "none",
                }}
            />

            {/* Micro-label */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    textShadow: "0 0 12px color-mix(in srgb, var(--gold) 60%, transparent)",
                }}
            >
                <span style={{ opacity: 0.8 }}>✦</span>
                Mastered
                <span style={{ opacity: 0.8 }}>✦</span>
            </div>

            {/* Icon */}
            <div
                style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--gold) 25%, var(--card)) 0%, var(--card) 80%)",
                    border: "2px solid color-mix(in srgb, var(--gold) 60%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    boxShadow: "0 0 32px color-mix(in srgb, var(--gold) 45%, transparent), inset 0 0 20px color-mix(in srgb, var(--gold) 15%, transparent)",
                    animation: "toast-icon-pulse 1.6s ease-in-out 0.3s infinite",
                    overflow: "hidden",
                }}
            >
                {icon ? (
                    <img src={icon} alt={skillName} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.25)" }} />
                ) : (
                    <span style={{ opacity: 0.5, fontSize: 24 }}>◎</span>
                )}
            </div>

            {/* Skill name */}
            <span
                style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: "-0.02em",
                    color: "var(--foreground)",
                    textAlign: "center",
                    lineHeight: 1.2,
                }}
            >
                {skillName}
            </span>

            {/* XP */}
            <span
                style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "var(--gold)",
                    textShadow: "0 0 14px color-mix(in srgb, var(--gold) 50%, transparent)",
                }}
            >
                +{xp.toLocaleString()} XP
            </span>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════
   3. LEVEL UP
   ═════════════════════════════════════════════════════════ */

export interface LevelUpToastProps {
    from: number;
    to: number;
    xpForNext: number;
}

export function LevelUpToast({ from, to, xpForNext }: LevelUpToastProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                minWidth: 320,
                padding: "24px 28px 22px",
                borderRadius: 22,
                background: "linear-gradient(160deg, color-mix(in srgb, var(--primary) 22%, var(--card)) 0%, color-mix(in srgb, var(--accent) 12%, var(--card)) 70%, var(--card) 100%)",
                border: "1.5px solid color-mix(in srgb, var(--primary) 60%, transparent)",
                boxShadow: "0 16px 56px rgba(0,0,0,0.6), 0 0 48px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Shockwave ring */}
            <div
                style={{
                    position: "absolute",
                    top: 40,
                    left: "50%",
                    width: 100,
                    height: 100,
                    marginLeft: -50,
                    borderRadius: "50%",
                    border: "2px solid color-mix(in srgb, var(--primary) 70%, transparent)",
                    animation: "toast-shockwave 1.2s cubic-bezier(0.22,1,0.36,1) 0.1s both",
                    pointerEvents: "none",
                }}
            />

            {/* Micro-label */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    textShadow: "0 0 12px color-mix(in srgb, var(--primary) 70%, transparent)",
                }}
            >
                ▲ Level Up ▲
            </div>

            {/* Number */}
            <span
                style={{
                    fontFamily: "var(--font-PowerInter), sans-serif",
                    fontWeight: 5000,
                    fontSize: 56,
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 24px color-mix(in srgb, var(--primary) 55%, transparent))",
                    animation: "toast-number-rise 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both",
                }}
            >
                {to}
            </span>

            {/* Subtext */}
            <span
                style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                }}
            >
                Level {from} → {to} · next {xpForNext.toLocaleString()} XP
            </span>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════
   4. TIER UP / RANK PROMOTION
   ═════════════════════════════════════════════════════════ */

export interface TierUpToastProps {
    worldColor: string;
    worldGlow: string;
    worldBorder: string;
    worldIcon: string;
    worldName: string;
    newRank: string;
    tier: number;
}

export function TierUpToast({
    worldColor,
    worldGlow,
    worldBorder,
    worldIcon,
    worldName,
    newRank,
    tier,
}: TierUpToastProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                minWidth: 360,
                padding: "26px 30px 24px",
                borderRadius: 24,
                background: `linear-gradient(160deg, ${worldGlow} 0%, color-mix(in srgb, var(--card) 92%, transparent) 60%, var(--card) 100%)`,
                border: `1.5px solid ${worldBorder}`,
                boxShadow: `0 20px 64px rgba(0,0,0,0.65), 0 0 56px ${worldGlow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Expanding rings */}
            {[0, 0.15, 0.3].map((delay, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: 60,
                        left: "50%",
                        width: 80,
                        height: 80,
                        marginLeft: -40,
                        borderRadius: "50%",
                        border: `1.5px solid ${worldColor}`,
                        opacity: 0.6,
                        animation: `toast-shockwave 1.6s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
                        pointerEvents: "none",
                    }}
                />
            ))}

            {/* Micro-label */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: worldColor,
                    textShadow: `0 0 14px ${worldGlow}`,
                }}
            >
                ✦ Rank Promoted ✦
            </div>

            {/* World icon */}
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 30% 30%, ${worldGlow} 0%, var(--card) 80%)`,
                    border: `2px solid ${worldBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    boxShadow: `0 0 32px ${worldGlow}, inset 0 0 20px ${worldGlow}`,
                    animation: "toast-icon-pulse 1.8s ease-in-out 0.3s infinite",
                }}
            >
                {worldIcon}
            </div>

            {/* New rank name */}
            <span
                style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 600,
                    fontSize: 22,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: worldColor,
                    textShadow: `0 0 24px ${worldGlow}`,
                    textAlign: "center",
                    lineHeight: 1.15,
                    animation: "toast-number-rise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
                }}
            >
                {newRank}
            </span>

            {/* Subtext */}
            <span
                style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                }}
            >
                {worldName} · Tier {tier}
            </span>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════
   5. STREAK — daily check-in
   ═════════════════════════════════════════════════════════ */

export interface StreakToastProps {
    days: number;
    xp: number;
}

export function StreakToast({ days, xp }: StreakToastProps) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 280,
                padding: "14px 20px 14px 14px",
                borderRadius: 18,
                background: "linear-gradient(135deg, color-mix(in srgb, var(--card) 96%, transparent) 0%, color-mix(in srgb, var(--gold) 8%, var(--card)) 100%)",
                border: "1.5px solid color-mix(in srgb, var(--gold) 50%, transparent)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 24px color-mix(in srgb, var(--gold) 28%, transparent), inset 0 1px 0 rgba(255,255,255,0.05)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Shimmer */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "60%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                    animation: "toast-shimmer 1.8s ease-out 0.2s both",
                    pointerEvents: "none",
                }}
            />

            {/* Flame icon */}
            <div
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "color-mix(in srgb, var(--gold) 18%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--gold) 50%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                    boxShadow: "0 0 16px color-mix(in srgb, var(--gold) 40%, transparent), inset 0 0 12px color-mix(in srgb, var(--gold) 20%, transparent)",
                    animation: "toast-icon-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                }}
            >
                🔥
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <span
                    style={{
                        fontFamily: "var(--font-display), sans-serif",
                        fontWeight: 600,
                        fontSize: 16,
                        letterSpacing: "-0.02em",
                        color: "var(--gold)",
                        textShadow: "0 0 14px color-mix(in srgb, var(--gold) 45%, transparent)",
                        lineHeight: 1.1,
                    }}
                >
                    {days} day streak
                </span>
                <span
                    style={{
                        fontFamily: "var(--font-body), sans-serif",
                        fontSize: 11,
                        color: "var(--muted-foreground)",
                    }}
                >
                    +{xp.toLocaleString()} XP · keep it alive
                </span>
            </div>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════
   6. MILESTONE — streak 7 / 30 / 90 / 180 / 360
   ═════════════════════════════════════════════════════════ */

export interface MilestoneToastProps {
    days: number;
    bonus: number;
    dailyXp: number;
}

export function MilestoneToast({ days, bonus, dailyXp }: MilestoneToastProps) {
    const total = bonus + dailyXp;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                minWidth: 340,
                padding: "28px 32px 26px",
                borderRadius: 24,
                background: "linear-gradient(160deg, color-mix(in srgb, var(--gold) 22%, var(--card)) 0%, color-mix(in srgb, var(--gold) 8%, var(--card)) 55%, var(--card) 100%)",
                border: "1.5px solid color-mix(in srgb, var(--gold) 65%, transparent)",
                boxShadow: "0 20px 64px rgba(0,0,0,0.65), 0 0 56px color-mix(in srgb, var(--gold) 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Expanding rings */}
            {[0, 0.2].map((delay, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: 70,
                        left: "50%",
                        width: 80,
                        height: 80,
                        marginLeft: -40,
                        borderRadius: "50%",
                        border: "1.5px solid color-mix(in srgb, var(--gold) 70%, transparent)",
                        animation: `toast-shockwave 1.5s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
                        pointerEvents: "none",
                    }}
                />
            ))}

            {/* Flame */}
            <div
                style={{
                    fontSize: 44,
                    lineHeight: 1,
                    animation: "toast-icon-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both, toast-icon-pulse 1.6s ease-in-out 0.8s infinite",
                    filter: "drop-shadow(0 0 20px color-mix(in srgb, var(--gold) 60%, transparent))",
                }}
            >
                🔥
            </div>

            {/* Days */}
            <span
                style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 600,
                    fontSize: 34,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg, var(--gold) 0%, #F5C41E 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 20px color-mix(in srgb, var(--gold) 55%, transparent))",
                    animation: "toast-number-rise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
                }}
            >
                {days} DAY STREAK
            </span>

            {/* Divider */}
            <div
                style={{
                    width: 60,
                    height: 1,
                    background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 60%, transparent), transparent)",
                }}
            />

            {/* Bonus */}
            <span
                style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 600,
                    fontSize: 18,
                    color: "var(--gold)",
                    textShadow: "0 0 20px color-mix(in srgb, var(--gold) 60%, transparent)",
                    letterSpacing: "-0.01em",
                }}
            >
                +{total.toLocaleString()} XP
            </span>

            <span
                style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                }}
            >
                {dailyXp.toLocaleString()} daily + {bonus.toLocaleString()} bonus
            </span>
        </div>
    );
}
