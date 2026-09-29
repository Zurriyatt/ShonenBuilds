// src/lib/auth/UserProvider.tsx

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "./verify";

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

            setUser(data.success ? data.data : null);
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