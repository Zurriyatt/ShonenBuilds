"use client";

import Link from "next/link";
import { useUser } from "@/lib/auth/UserProvider";
import { useState,useEffect } from "react";
import { User } from "@/lib/auth/verify";
/* =========================================================
   LOGO MARK
   ========================================================= */
function LogoMark({ size = 34 }: { size?: number }) {
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            {/* Outer glow */}
            <div
                className="absolute rounded-[10px] opacity-40"
                style={{
                    inset: -2,
                    background: "linear-gradient(135deg, #FF6B1A, #F5A41E)",
                    filter: "blur(5px)",
                }}
            />
            {/* Badge */}
            <div
                className="relative w-full h-full rounded-[10px] flex items-center justify-center"
                style={{
                    background: "linear-gradient(145deg, #1B1A26 0%, #0F0E1A 100%)",
                    border: "1px solid rgba(255,107,26,0.6)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
            >
                <svg
                    width={size * 0.47}
                    height={size * 0.53}
                    viewBox="0 0 16 18"
                    fill="none"
                >
                    <path
                        d="M13 5.5C13 4 11.5 3 9 3C6.5 3 4.5 4.2 4.5 6C4.5 7.8 6.5 8.5 8.5 9C10.5 9.5 13 10.5 13 12.5C13 14.5 11 15.5 8.5 15.5C6 15.5 3.5 14.2 3 12.5"
                        stroke="url(#lm)"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient
                            id="lm"
                            x1="3"
                            y1="3"
                            x2="13"
                            y2="15"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FF6B1A" />
                            <stop offset="1" stopColor="#F5A41E" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}

/* =========================================================
   NAVBAR
   ========================================================= */
export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
    const { user, loading } = useUser();

    const navList = [
        { name: "Skill Tree", href: "/skill-tree" },
        { name: "Squads", href: "/squads" },
        { name: "Ranks", href: "/ranks" },
        { name: "Leaderboard", href: "/leaderboard" },
    ];

    return (
        <nav
            className="sticky top-0 left-0 right-0 z-40 w-full flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 h-14 border-b bg-background/85 backdrop-blur-xl border-border/70"
        >
            {/* ── LEFT — hamburger (mobile/tablet) + logo ── */}
            <div onClick={onMenuClick} className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    aria-label="Open menu"
                    className=" w-9 h-9 -ml-1 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-secondary transition-colors active:scale-95"
                >
                    <span className="block w-5 h-[1.5px] rounded-full bg-foreground/70" />
                    <span className="block w-3.5 h-[1.5px] rounded-full bg-foreground/50" />
                    <span className="block w-5 h-[1.5px] rounded-full bg-foreground/70" />
                </button>

                <Link href="/" className="flex items-center gap-2.5 min-w-0">
                    <LogoMark size={30} />
                    <span className="font-display font-bold text-[15px] tracking-[-0.03em] text-foreground leading-none truncate">
                        Shonen
                        <span className="bg-gradient-to-r from-[#FF6B1A] to-[#F5A41E] bg-clip-text text-transparent">
                            Builds
                        </span>
                    </span>
                </Link>
            </div>

            {/* ── CENTER — desktop nav links ── */}
            <ul className="hidden lg:flex items-center gap-7">
                {navList.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            className="text-[13px] text-muted-foreground font-body hover:text-foreground transition-colors tracking-[-0.01em]"
                        >
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* ── RIGHT — auth action ── */}
            <div className="flex items-center gap-2 shrink-0">
                {loading ? (
                    <div className="w-24 h-8 rounded-md bg-secondary animate-pulse" />
                ) : user ? (
                    <Link
                        href="/realm"
                        className="bg-primary/20 border border-primary/40 text-primary rounded-md py-1.5 px-3.5 font-body text-[13px] font-medium hover:bg-primary/30 transition-colors"
                    >
                        Your Realm
                    </Link>
                ) : (
                    <Link
                        href="/auth?login=true"
                        className="bg-primary/20 border border-primary/40 text-primary rounded-md py-1.5 px-3.5 font-body text-[13px] font-medium hover:bg-primary/30 transition-colors"
                    >
                        Log In
                    </Link>
                )}
            </div>
        </nav>
    );
}


