"use client";

import { Skranji } from "next/font/google";
import Link from "next/link";
export function Navbar() {
    const navList = [
        {
            name: "Skill Tree",
            href: "skill-tree",
        },
        {
            name: "Squads",
            href: "Squads",
        },
        {
            name: "Ranks",
            href: "ranks",
        },
        {
            name: "Leaderboard",
            href: "leaderboard",
        },
    ];
    return (
        <>
            <nav className="min-w-screen h-[clamp(4rem,8vh,9rem)] flex justify-between p-5 px-10 backdrop-blur-xs items-center max-w-screen  overflow-x-hidden">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Logo mark */}
                    <div style={{ position: "relative", width: 34, height: 34 }}>
                        {/* Outer glow ring */}
                        <div
                            style={{
                                position: "absolute",
                                inset: -2,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, #FF6B1A, #F5A41E)",
                                opacity: 0.4,
                                filter: "blur(5px)",
                            }}
                        />
                        {/* Main badge */}
                        <div
                            style={{
                                position: "relative",
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: "linear-gradient(145deg, #1B1A26 0%, #0F0E1A 100%)",
                                border: "1px solid rgba(255,107,26,0.6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                            }}
                        >
                            {/* S lettermark */}
                            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                                <path
                                    d="M13 5.5C13 4 11.5 3 9 3C6.5 3 4.5 4.2 4.5 6C4.5 7.8 6.5 8.5 8.5 9C10.5 9.5 13 10.5 13 12.5C13 14.5 11 15.5 8.5 15.5C6 15.5 3.5 14.2 3 12.5"
                                    stroke="url(#sgrad)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient
                                        id="sgrad"
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
                    <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
                        <span
                            className="text-xl"
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                color: "white",
                                letterSpacing: "-0.03em",
                            }}
                        >
                            Shonen
                        </span>
                        <span
                            className="text-xl"
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                letterSpacing: "-0.03em",
                                background: "linear-gradient(90deg, #FF6B1A, #F5A41E)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Builds
                        </span>
                    </div>
                </div>

                <ul className="flex gap-8 transition-all ease-in">
                    {navList.map((link) => (
                        <Link key={link.name} href={link.href}>
                            {" "}
                            <li className="font-sans text-primary-foreground/50 hover:text-primary-foreground hover:cursor-pointer transition-all ease-in">
                                {link.name}
                            </li>
                        </Link>
                    ))}
                </ul>

                <button
                    className="bg-primary/20 border border-[rgba(138,92,245,0.4)] text-primary rounded-sm py-1 px-4 font-body text-lg  font-medium hover:cursor-pointer duration-200 transition-all ease-in"
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(138,92,245,0.25)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(138,92,245,0.7)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--color-violet-dim)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(138,92,245,0.4)";
                    }}
                >
                    Log In
                </button>
            </nav>
        </>
    );
}
