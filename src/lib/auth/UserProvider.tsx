// src/lib/auth/UserProvider.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface User {
    userId: string;
    email: string;
    name: string;
    username: string;
    rank: any;
    why: string;
    goal: string;
    world: string;
    sessionId: string;
}

interface UserContextValue {
    user: User | null;
    loading: boolean;
}

const UserContext = createContext<UserContextValue>({
    user: null,
    loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth/verify",{method:"GET"})
            .then((r) => r.json())
            .then((data) => {
                console.log(data,"Detecteed")
                setUser(data.success ? data.data : null);
            })
            .catch(() =>{
              console.log(user,"catch to detect")
              setUser(null)
            })
            .finally(() => setLoading(false));
            
    }, []);

    return (
        <UserContext.Provider value={{ user, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}