"use client";
import { UserProvider } from "@/lib/auth/UserProvider";
import { Navbar } from "@/components/rootLayout/Navbar";
import { SideBar } from "@/components/Sidebar";
import { useUser } from "@/lib/auth/UserProvider";
import { Toaster } from "react-hot-toast";

import { useState, useEffect } from "react";
export function VisibleLayout({ children }: { children: React.ReactNode }) {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    return (
        <>
            <UserProvider>
                <Toaster
                    position="top-center"
                    gutter={12}
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: "transparent",
                            boxShadow: "none",
                            padding: 0,
                            borderRadius: 0,
                            maxWidth: "none",
                        },
                    }}
                />

                <div className="w-full h-full max-w-screen  ">
                    <header className="sticky top-0 left-0 right-0 z-30 ">
                        <Navbar onMenuClick={() => setSidebarVisible(true)} />
                        <SideBar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
                    </header>
                    <main className="pt-2"> {children}</main>
                </div>
            </UserProvider>
        </>
    );
}
