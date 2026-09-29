"use client";
import { useState, useEffect } from "react";
import { getLayout, getConnections, BRANCH_LABELS } from "@/lib/skills/layout";
import type { Positioned } from "@/lib/skills/layout";
import type { Skill } from "@/lib/skills/skills";
import { useUser } from "@/lib/auth/UserProvider";

const CANVAS_SIZE = 4000;
const HALF_CANVAS = CANVAS_SIZE / 2;

/* ═════════════════════════════════════════════════════════
   TYPES
   ═════════════════════════════════════════════════════════ */

type SkillState = "locked" | "unlocked" | "in_progress" | "mastered";

/* ═════════════════════════════════════════════════════════
   PLACEHOLDER ICON
   ═════════════════════════════════════════════════════════ */

function PlaceholderIcon() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
    );
}

/* ═════════════════════════════════════════════════════════
   SKILL NODE — the circle
   ═════════════════════════════════════════════════════════ */

function SkillNode({ skill, state, onClick }: { skill: Skill; state: SkillState; onClick: () => void }) {
    const hasIcon = !!skill.icon;
    const isLocked = state === "locked";

    const borderColor =
        state === "mastered"
            ? "var(--primary)"
            : state === "in_progress"
              ? "var(--accent)"
              : state === "unlocked"
                ? "var(--gold)"
                : "var(--border)";

    const bg = isLocked
        ? "var(--card)"
        : state === "mastered"
          ? "color-mix(in srgb, var(--primary) 12%, var(--card))"
          : state === "in_progress"
            ? "color-mix(in srgb, var(--accent) 10%, var(--card))"
            : "color-mix(in srgb, var(--gold) 10%, var(--card))";

    return (
        <button
            onClick={onClick}
            className="w-16 h-16 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all cursor-pointer hover:scale-110"
            style={{ borderColor, background: bg }}
        >
            {hasIcon ? (
                <img src={skill.icon as string} alt={skill.name} className="w-full h-full object-cover scale-[1.25]" />
            ) : (
                <span style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
                    <PlaceholderIcon />
                </span>
            )}
        </button>
    );
}

/* ═════════════════════════════════════════════════════════
   POSITIONED NODE — circle + name + state
   ═════════════════════════════════════════════════════════ */

function PositionedNode({
    p,
    state,
    onSelect,
}: {
    p: Positioned;
    state: SkillState;
    onSelect: (slug: string) => void;
}) {
    const { skill, x, y } = p;

    const nameColor =
        state === "mastered"
            ? "var(--primary)"
            : state === "in_progress"
              ? "var(--accent)"
              : state === "unlocked"
                ? "var(--foreground)"
                : "var(--muted-foreground)";

    return (
        <div>
            <div className="absolute" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
                <SkillNode skill={skill} state={state} onClick={() => onSelect(skill.slug)} />
            </div>
            <div
                className="absolute text-center whitespace-nowrap text-[11px] font-body pointer-events-none leading-tight"
                style={{
                    left: x,
                    top: y + 42,
                    transform: "translateX(-50%)",
                    color: nameColor,
                }}
            >
                {skill.name}
            </div>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════
   SKILL BOTTOM SHEET
   ═════════════════════════════════════════════════════════ */

function SkillBottomSheet({
    skill,
    state,
    currentBestSet,
    onClose,
    onLogged,
}: {
    skill: Skill | null;
    state: SkillState;
    currentBestSet: number;
    onClose: () => void;
    onLogged: (data: {
        xpDelta: number;
        newState: string;
        justMastered: boolean;
        levelUp: { from: number; to: number } | null;
        tierUp: { from: number; to: number } | null;
    }) => void;
}) {
    const [reps, setReps] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const open = skill !== null;

    /* ── Submit reps ─────────────────────────────────────── */
    async function handleSubmit() {
        if (!skill) return;
        const value = parseInt(reps, 10);
        if (isNaN(value) || value < 0) {
            setError("Enter a valid number");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/skills/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skillSlug: skill.slug, reps: value }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Failed to log");
                setLoading(false);
                return;
            }

            onLogged(data.data);
            setReps("");
            setLoading(false);
        } catch {
            setError("Network error");
            setLoading(false);
        }
    }

    /* ── State colors ────────────────────────────────────── */
    const stateLabel =
        state === "mastered"
            ? "Mastered"
            : state === "in_progress"
              ? "In Progress"
              : state === "unlocked"
                ? "Unlocked"
                : "Locked";

    const stateColor =
        state === "mastered"
            ? "var(--primary)"
            : state === "in_progress"
              ? "var(--accent)"
              : state === "unlocked"
                ? "var(--gold)"
                : "var(--muted-foreground)";

    const target = skill?.System.repsTarget ?? [0, 0, 0];
    const unit = skill?.System.unit === "sec" ? "sec" : "reps";
    const locked = state === "locked";

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-40 transition-opacity duration-300"
                style={{
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                }}
            />

            {/* Sheet */}
            <div
                className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl border-t border-border transition-transform duration-300 ease-out"
                style={{
                    background: "color-mix(in srgb, var(--card) 97%, transparent)",
                    backdropFilter: "blur(24px)",
                    transform: open ? "translateY(0)" : "translateY(100%)",
                    boxShadow: open ? "0 -20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
                    maxHeight: "70vh",
                }}
            >
                {skill && (
                    <div className="max-w-md mx-auto px-6 pt-6 pb-8 flex flex-col gap-5">
                        {/* Drag handle */}
                        <div className="flex justify-center -mt-2 mb-1">
                            <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
                        </div>

                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className="shrink-0">
                                <SkillNode skill={skill} state={state} onClick={() => {}} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-display font-bold text-[20px] leading-tight text-foreground tracking-[-0.02em]">
                                    {skill.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span
                                        className="text-[10px] font-body font-bold tracking-[0.08em] uppercase px-2 py-[3px] rounded-full"
                                        style={{
                                            color: stateColor,
                                            background: `color-mix(in srgb, ${stateColor} 12%, transparent)`,
                                            border: `1px solid color-mix(in srgb, ${stateColor} 35%, transparent)`,
                                        }}
                                    >
                                        {stateLabel}
                                    </span>
                                    <span className="text-[10px] font-body text-muted-foreground">
                                        Tier {skill.tier}
                                    </span>
                                </div>
                                <p className="text-[12px] font-body text-muted-foreground mt-2 leading-snug">
                                    {skill.description}
                                </p>
                            </div>
                        </div>

                        {/* Targets */}
                        <div className="grid grid-cols-3 gap-2">
                            {["Unlock", "In Progress", "Mastery"].map((label, i) => {
                                const isActive = currentBestSet >= target[i];
                                return (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center gap-1 rounded-xl py-2.5"
                                        style={{
                                            background: "var(--secondary)",
                                            border: `1px solid ${isActive ? stateColor : "var(--border)"}`,
                                            opacity: isActive ? 1 : 0.6,
                                        }}
                                    >
                                        <span className="text-[9px] font-body tracking-widest uppercase text-muted-foreground">
                                            {label}
                                        </span>
                                        <span
                                            className="font-display font-bold text-[16px]"
                                            style={{ color: isActive ? stateColor : "var(--foreground)" }}
                                        >
                                            {target[i]} {unit}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* XP reward */}
                        <div
                            className="flex items-center justify-between rounded-xl px-4 py-3"
                            style={{
                                background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                                border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
                            }}
                        >
                            <span className="text-[11px] font-body tracking-wider uppercase text-muted-foreground">
                                Max XP
                            </span>
                            <span className="font-display font-bold text-[15px]" style={{ color: "var(--primary)" }}>
                                +{skill.System.xpGain.toLocaleString()} XP
                            </span>
                        </div>

                        {/* Rep input */}
                        {!locked && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-body tracking-wider uppercase text-muted-foreground">
                                    Log your best {unit === "sec" ? "hold" : "set"}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        value={reps}
                                        onChange={(e) => setReps(e.target.value)}
                                        placeholder={`e.g. ${target[2]}`}
                                        className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-[15px] font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60"
                                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !reps}
                                        className="px-6 rounded-xl font-display font-bold text-[14px] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, var(--primary) 0%, var(--primary) 55%, var(--accent) 140%)",
                                            boxShadow: "0 0 20px color-mix(in srgb, var(--primary) 40%, transparent)",
                                        }}
                                    >
                                        {loading ? "..." : "Log"}
                                    </button>
                                </div>
                                {currentBestSet > 0 && (
                                    <span className="text-[11px] font-body text-muted-foreground">
                                        Current best: <strong style={{ color: stateColor }}>{currentBestSet}</strong>{" "}
                                        {unit}
                                    </span>
                                )}
                                {error && <span className="text-[11px] font-body text-destructive">{error}</span>}
                            </div>
                        )}

                        {locked && (
                            <div
                                className="rounded-xl px-4 py-3 text-center text-[12px] font-body"
                                style={{
                                    background: "var(--secondary)",
                                    color: "var(--muted-foreground)",
                                }}
                            >
                                🔒 Reach Tier {skill.tier} to unlock this skill
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="text-[12px] font-body text-muted-foreground hover:text-foreground transition-colors py-1"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

/* ═════════════════════════════════════════════════════════
   PAGE
   ═════════════════════════════════════════════════════════ */

export default function SkillTreePage() {
    // Now stateFor can use skillMap:

    const { user, refresh } = useUser();
    const [skillMap, setSkillMap] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        if (!user) return;

        fetch("/api/skills/mine")
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    const map = new Map<string, number>();
                    for (const row of data.data.skills) {
                        map.set(row.skillSlug, row.bestSet);
                    }
                    setSkillMap(map);
                }
            })
            .catch((err) => console.error("Skill fetch failed:", err));
    }, [user]);
    function stateFor(skill: Skill): SkillState {
        if (!user) return "locked";
        if (user.tier < skill.tier) return "locked";

        const best = skillMap.get(skill.slug) ?? 0;
        const target = skill.System.repsTarget;

        if (best >= target[2]) return "mastered";
        if (best >= target[0]) return "in_progress";
        return "unlocked";
    }

    const [scale, setScale] = useState(0.5);
    const [origin, setOrigin] = useState<{
        fx: number;
        fy: number;
        cx: number;
        cy: number;
    } | null>(null);
    const [canvas, setCanvas] = useState({ x: 0, y: 0 });
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

    const layout = getLayout();
    const connections = getConnections(layout);

    const selectedSkill = selectedSlug ? (layout.find((p) => p.skill.slug === selectedSlug)?.skill ?? null) : null;


    /* ── Pan ─────────────────────────────────────────────── */
    function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
        if ((e.target as HTMLElement).closest("button")) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setOrigin({ fx: e.clientX, fy: e.clientY, cx: canvas.x, cy: canvas.y });
    }
    function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!origin) return;
        setCanvas({
            x: origin.cx + (e.clientX - origin.fx),
            y: origin.cy + (e.clientY - origin.fy),
        });
    }
    function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        setOrigin(null);
    }

    /* ── Zoom ────────────────────────────────────────────── */
    function zoomIn() {
        setScale(Math.min(1, scale * 1.2));
    }
    function zoomOut() {
        setScale(Math.max(0.3, scale * 0.8));
    }

    /* ── After logging reps ──────────────────────────────── */
    async function handleLogged(data: {
        xpDelta: number;
        newState: string;
        justMastered: boolean;
        levelUp: { from: number; to: number } | null;
        tierUp: { from: number; to: number } | null;
    }) {
        // Close the sheet
        setSelectedSlug(null);

        // Toast / celebration logic — build later
        if (data.tierUp) {
            console.log(`🎉 TIER UP! ${data.tierUp.from} → ${data.tierUp.to}`);
        } else if (data.levelUp) {
            console.log(`✨ Level Up! ${data.levelUp.from} → ${data.levelUp.to}`);
        } else if (data.justMastered) {
            console.log(`👑 Mastered!`);
        } else if (data.xpDelta > 0) {
            console.log(`+${data.xpDelta} XP`);
        }

        // Refresh global user so streak / level / xp update
        await refresh();
    }

    return (
        <>
            <div
                className="relative h-[calc(100dvh-66px)] w-full overflow-hidden select-none touch-none"
                style={{ cursor: origin ? "grabbing" : "grab" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div
                    className="absolute bg-background"
                    style={{
                        left: "50%",
                        top: "50%",
                        marginLeft: -HALF_CANVAS,
                        marginTop: -HALF_CANVAS,
                        width: CANVAS_SIZE,
                        height: CANVAS_SIZE,
                        transform: `translate(${canvas.x}px, ${canvas.y}px) scale(${scale})`,
                    }}
                >
                    {/* Branch labels */}
                    {BRANCH_LABELS.map((l) => (
                        <div
                            key={l.name}
                            className="absolute pointer-events-none select-none whitespace-nowrap text-2xl"
                            style={{
                                left: l.x,
                                top: l.y,
                                rotate: l.rotate,
                                transform: "translate(-50%, -50%)",
                                fontFamily: "var(--font-display), monospace",
                                fontWeight: 500,
                                letterSpacing: "0.35em",
                                textTransform: "uppercase",
                                opacity: 0.55,
                                color: "var(--muted-foreground)",
                            }}
                        >
                            {l.name}
                        </div>
                    ))}

                    {/* SVG connectors */}
                    <svg className="absolute inset-0 pointer-events-none" width={CANVAS_SIZE} height={CANVAS_SIZE}>
                        {connections.map(({ from, to, key }) => (
                            <line
                                key={key}
                                x1={from.x}
                                y1={from.y}
                                x2={to.x}
                                y2={to.y}
                                stroke="var(--border)"
                                strokeWidth={1.5}
                            />
                        ))}
                    </svg>

                    {/* Nodes */}
                    {layout.map((p) => (
                        <PositionedNode key={p.skill.slug} p={p} state={stateFor(p.skill)} onSelect={setSelectedSlug} />
                    ))}
                </div>

                {/* Zoom controls */}
                <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
                    <button
                        onClick={zoomIn}
                        aria-label="Zoom in"
                        className="w-11 h-11 rounded-xl bg-card border border-border text-foreground text-xl font-bold flex items-center justify-center hover:bg-secondary hover:border-primary/40 active:scale-95 transition-all"
                        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
                    >
                        +
                    </button>
                    <button
                        onClick={zoomOut}
                        aria-label="Zoom out"
                        className="w-11 h-11 rounded-xl bg-card border border-border text-foreground text-xl font-bold flex items-center justify-center hover:bg-secondary hover:border-primary/40 active:scale-95 transition-all"
                        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
                    >
                        −
                    </button>
                </div>
            </div>

            {/* Bottom sheet */}
            <SkillBottomSheet
                skill={selectedSkill}
                state={selectedSkill ? stateFor(selectedSkill) : "locked"}
                currentBestSet={0 /* TODO: read from user_skills map */}
                onClose={() => setSelectedSlug(null)}
                onLogged={handleLogged}
            />
        </>
    );
}
