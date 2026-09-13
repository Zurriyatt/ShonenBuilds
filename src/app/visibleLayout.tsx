"use client";
import { Navbar } from "@/components/rootLayout/Navbar";
export function VisibleLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="w-full h-full max-w-screen ">
                <header className ="sticky top-0 left-0 right-0 z-10 ">
                    <Navbar />
                </header>
                <main className = "pt-10"> {children}</main>
            </div>
        </>
    );
}
