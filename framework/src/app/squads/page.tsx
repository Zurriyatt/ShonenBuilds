"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { SectionHeader } from "../leaderboard/page";
import toast from "react-hot-toast";
import { useUser } from "@/lib/auth/UserProvider";
import { friendDataStructure } from "../api/users/friends/route";
import { pendingFriendDataStructure } from "../api/users/pendingReqs/route";
export default function Squads() {
    const router = useRouter();
    const [activeId, setActiveId] = useState(1);
    const [pcView, setPcView] = useState(false);
    const [friendQuery, setFriendQuery] = useState("");
    const [friendReqLoading, setFriendReqLoading] = useState(false);
    const [friends, setFriends] = useState<friendDataStructure[] | null>(null);
    const [pendingReqs, setPendingReqs] = useState<pendingFriendDataStructure[] | null>(null);
    const [friendListLoading, setFriendListLoading] = useState<boolean>(false);
    // true = All Friends, false = Pending Requests
    const [showAllFriends, setShowAllFriends] = useState(true);
    const USER = useUser();
    const clientUserId = USER.user?.userId;
    const handleCurrentFriends = async () => {
            try {
                const req = await fetch("/api/users/friends", { method: "GET" });
                const res = await req.json();
                if (!res.success || !res.data) {
                    toast.error("Friend list not available!");
                    return;
                }
                setFriends(res.data);
            } catch {
                toast.error("Friend list not available!");
            }
        };

        const handlePendingReqs = async () => {
            try {
                const req = await fetch("/api/users/pendingReqs", { method: "GET" });
                const res = await req.json();
                if (!res.success || !res.data) {
                    toast.error("Pending requests not available!");
                    return;
                }
                setPendingReqs(res.data);
            } catch {
                toast.error("Pending requests not available!");
            }
        };
        const loadAll = async () => {
            setFriendListLoading(true);
            try {
                await Promise.all([handleCurrentFriends(), handlePendingReqs()]);
            } finally {
                setFriendListLoading(false);
            }
        };

    const btnSections = [
        {
            name: "Your Squad",
            id: 1,
        },
        {
            name: "Search Squads",
            id: 2,
        },
        {
            name: "Your Friends",
            id: 3,
        },
    ];

    useEffect(() => {
        const handleResize = () => {
            setPcView(window.innerWidth > 1023);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        
        
        loadAll();

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const handleRespond = async (reqItem: pendingFriendDataStructure, action: "accept" | "reject") => {
        try {
            const res = await fetch("/api/users/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetUserId: reqItem.userId,
                    action,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.message || "Action failed");
                return;
            }

            // Remove from pendingReqs immediately
            setPendingReqs((prev) => (prev ? prev.filter((item) => item.userId !== reqItem.userId) : []));
            
            // If accepted, add directly to friends list
            if (action === "accept") {
                setFriends((prev) => [
                    ...(prev ?? []),
                    {
                        userId: reqItem.userId,
                        username: reqItem.username,
                        name: reqItem.name,
                        avatar: reqItem.avatar,
                        world: reqItem.world,
                        path: reqItem.path,
                    },
                ]);
            }

            toast.success(data.message);

            await loadAll();
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <>
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
                    Squads
                </span>
                <div className="w-8 h-8" />
            </div>
            <div className="Squad flex lg:flex-row flex-col lg:px-12 lg:py-8 sm:p-6 p-2 gap-8 ">
                <aside className="flex flex-col gap-4">
                    <SectionHeader
                        icon="⚑"
                        eyebrow="Competitive Squads and friends"
                        badgeText="Global"
                        title="Squads"
                        subtitle="Rise through the ranks with your team and friends."
                        className="items-start justify-start "
                    />
                    {pcView && (
                        <nav
                            className="flex flex-col gap-0.5 rounded-[18px] p-2"
                            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                        >
                            <span className="px-3 pt-2 pb-2 text-[9px] font-body font-bold tracking-[0.24em] uppercase text-muted-foreground/60">
                                Options
                            </span>

                            {btnSections.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveId(s.id);
                                    }}
                                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:cursor-pointer hover:bg-secondary/50 ${activeId == s.id && "border-l-5  border-primary bg-primary/8"}`}
                                >
                                    <span className="font-body text-[13px] font-semibold text-foreground/70">
                                        {s.name}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    )}
                </aside>
                <section className="flex flex-col flex-1">
                    {!pcView && (
                        <div className="flex items-center gap-3 mb-7">
                            {btnSections.map((each: any) => {
                                return (
                                    <nav
                                        key={each.id}
                                        onClick={() => {
                                            setActiveId(each?.id);
                                        }}
                                        className={`font-PowerInter font-medium text-sm text-foreground/30 hover:text-primary/80 border-[1.5px] border-foreground/20 hover:border-primary/50 hover:bg-primary/15 bg-primary/5 p-2 rounded-xl hover:cursor-pointer transition-all duration-150 ease-initial ${activeId == each.id && "border-primary/50 bg-primary/15 text-primary/80"}`}
                                    >
                                        {each.name}
                                    </nav>
                                );
                            })}
                        </div>
                    )}

                    {/* 1. YOUR SQUAD */}
                    {activeId == 1 && (
                        <div className="rounded-2xl border border-border/50 bg-card/40 px-4 sm:px-6 py-6 sm:py-8 overflow-hidden h-fit min-h-50 w-full flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
                                <div className="flex flex-col gap-1">
                                    <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-foreground">
                                        Your Squad
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Team up with allies to climb the global leaderboard and unlock squad rewards.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="shrink-0 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:cursor-pointer"
                                >
                                    + Create Squad
                                </button>
                            </div>

                            {/* Empty State (Replace with Squad Dashboard & Member Roster once joined) */}
                            <div className="flex flex-col flex-1 items-center justify-center gap-3 py-8 text-center">
                                <p className="text-foreground/80 font-medium">You are not in any squad</p>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    Create your own guild to lead the ranks or browse existing squads looking for new
                                    members.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveId(2)}
                                    className="mt-1 rounded-xl border border-border bg-secondary/40 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-secondary hover:cursor-pointer"
                                >
                                    Browse Open Squads
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. SEARCH SQUADS */}
                    {activeId == 2 && (
                        <div className="rounded-2xl border border-border/50 bg-card/40 px-4 sm:px-6 py-6 sm:py-8 overflow-hidden h-fit min-h-50 w-full flex flex-col gap-6">
                            <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
                                <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-foreground">
                                    Search Squads
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Discover active guilds by name, tag, or rank requirement and request to join.
                                </p>
                            </div>

                            {/* Industry-Standard Search & Filter Bar */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="Search by squad name or tag (e.g. #SHONEN)..."
                                    className="flex-1 rounded-xl border border-border/60 bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="rounded-xl border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-semibold text-primary hover:cursor-pointer"
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:cursor-pointer"
                                    >
                                        Open to Join
                                    </button>
                                </div>
                            </div>

                            {/* Empty / Coming Soon State (Replace with Squad Cards List) */}
                            <div className="flex flex-col flex-1 items-center justify-center gap-1 py-8 text-center">
                                <p className="text-foreground/80 font-medium">No squads listed yet</p>
                                <p className="text-xs text-muted-foreground">
                                    Search results and recommended guilds will appear here.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 3. YOUR FRIENDS */}
                    {activeId == 3 && (
                        <div className="rounded-2xl border border-border/50 bg-card/40 px-4 sm:px-6 py-6 sm:py-8 overflow-hidden h-fit min-h-50 w-full flex flex-col gap-6">
                            <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
                                <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-foreground">
                                    Your Friends
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Manage your friend list, check player activity, and invite allies to your squad.
                                </p>
                            </div>

                            {/* Add Friend & Filter Bar */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    value={friendQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFriendQuery(value);
                                    }}
                                    type="text"
                                    placeholder="Add friend by username"
                                    className="flex-1 rounded-xl border border-border/60 bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        (async function execute() {
                                            setFriendReqLoading(true);
                                            const req = await fetch("api/users/search", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({ username: friendQuery }),
                                            });
                                            const res = await req.json();
                                            if (!res.success) {
                                                toast.error(res.message);
                                                setFriendReqLoading(false);
                                                return;
                                            }
                                                toast.success(res.message);
                                                
                                            setFriendReqLoading(false);
                                            await loadAll();
                                        })();
                                    }}
                                    disabled={friendReqLoading}

                                    className={`shrink-0 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:cursor-pointer ${friendReqLoading && "bg-primary/30 animate-pulse"}`}
                                >
                                    Send Request
                                </button>
                            </div>

                            <div className="flex items-center gap-4 border-b border-border/30 pb-2 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setShowAllFriends(true)}
                                    className={`pb-2 -mb-2.5 hover:cursor-pointer ${
                                        showAllFriends
                                            ? "text-foreground border-b-2 border-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {friendListLoading ? (
                                        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                        `All Friends (${friends != null ? friends.length : 0})`
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAllFriends(false)}
                                    className={`pb-2 -mb-2.5 hover:cursor-pointer ${
                                        !showAllFriends
                                            ? "text-foreground border-b-2 border-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {friendListLoading ? (
                                        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                        `Pending Requests (${pendingReqs != null ? pendingReqs.length : 0})`
                                    )}
                                </button>
                            </div>

                            {/* Sub-filters (All / Pending) */}

                            {showAllFriends ? (
                                friends && friends.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {friends.map((friend) => (
                                            <div
                                                key={friend.userId}
                                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/50"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                                    {/* Avatar with fallback to first letter */}
                                                    <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 border bg-secondary border-border/50 overflow-hidden">
                                                        {friend.avatar ? (
                                                            <img
                                                                src={friend.avatar}
                                                                alt={friend.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="font-display font-bold text-sm text-foreground/80">
                                                                {friend.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* User Info */}
                                                    <div className="flex flex-col min-w-0 gap-1">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="font-display font-bold text-[13px] sm:text-sm truncate text-foreground">
                                                                {friend.name}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground truncate">
                                                                @{friend.username}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-[9px] uppercase font-bold tracking-wide text-primary truncate">
                                                                {friend.path}
                                                            </span>
                                                            <span className="text-[8px] text-muted-foreground">•</span>
                                                            <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground truncate">
                                                                {friend.world} world
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col flex-1 items-center justify-center gap-1 py-8 text-center">
                                        <p className="text-foreground/80 font-medium">You have no friends yet...</p>
                                        <p className="text-xs text-muted-foreground">
                                            Enter a player&apos;s username above to send a friend request.
                                        </p>
                                    </div>
                                )
                            ) : pendingReqs && pendingReqs.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {pendingReqs.map((req) => {
                                        const isIncoming = req.requestedBy !== clientUserId;

                                        return (
                                            <div
                                                key={req.connectionId}
                                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/50"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                                    {/* Avatar with fallback to first letter */}
                                                    <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 border bg-secondary border-border/50 overflow-hidden">
                                                        {req.avatar ? (
                                                            <img
                                                                src={req.avatar}
                                                                alt={req.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="font-display font-bold text-sm text-foreground/80">
                                                                {req.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* User Info */}
                                                    <div className="flex flex-col min-w-0 gap-1">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="font-display font-bold text-[13px] sm:text-sm truncate text-foreground">
                                                                {req.name}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground truncate">
                                                                @{req.username}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-[9px] uppercase font-bold tracking-wide text-primary truncate">
                                                                {req.path}
                                                            </span>
                                                            <span className="text-[8px] text-muted-foreground">•</span>
                                                            <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground truncate">
                                                                {req.world} world
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side: Accept/Reject for incoming, Sent badge for outgoing */}
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {isIncoming ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRespond(req, "accept")}
                                                                className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold hover:cursor-pointer"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRespond(req, "reject")}
                                                                className="px-2.5 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground border border-border/50 text-[11px] font-bold hover:cursor-pointer"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border/50">
                                                            Sent
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1 items-center justify-center gap-1 py-8 text-center">
                                    <p className="text-foreground/80 font-medium">No pending requests...</p>
                                    <p className="text-xs text-muted-foreground">
                                        Incoming and outgoing friend requests will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
