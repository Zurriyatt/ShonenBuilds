// src/lib/auth/UserProvider.tsx

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "./verify";
import { showMilestoneToast, showStreakToast } from "../toast";

interface UserContextValue {
    user: User | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
    user: null,
    loading: true,
    refresh: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const res = await fetch("/api/auth/verify", {
                method: "GET",
                headers: { "x-user-timezone": timezone },
            });
            const data = await res.json();

            /* ── Guard: no user → bail before touching data.data ── */
            if (!data.success || !data.data) {
                setUser(null);
                return;
            }

            setUser(data.data);

            /* ── Toast triggers ────────────────────────────────────
               milestoneHit  → big celebration (rare)
               streakAdvanced → daily toast (once per day)
               otherwise     → silent                                  */
            if (data.data.milestoneHit) {
                showMilestoneToast({
                    days: data.data.milestoneHit,
                    bonus: data.data.milestoneBonus,
                    dailyXp: 25,
                });
            } else if (data.data.streakAdvanced) {
                showStreakToast({
                    days: data.data.currentStreak,
                    xp: 25,
                });
            }
        } catch (err) {
            console.error("User fetch failed:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, loading, refresh: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
