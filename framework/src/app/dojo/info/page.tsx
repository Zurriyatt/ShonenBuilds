"use client";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/auth/UserProvider";
import { User } from "@/lib/auth/verify";
import { getWorld } from "@/lib/world/MPS";
import toast from "react-hot-toast";

export default function InfoPage() {
    const [loading, setLoading] = useState(false);
    const [notAuth, setNotAuth] = useState(true);
    const [userData, setUserData] = useState<User | null>(null);
    const USER_STATE = useUser();
    const user = USER_STATE.user;
    const world = getWorld(user?.world ?? "") ?? "";

    // ── Avatar Upload States ──
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (USER_STATE.loading) {
            setLoading(true);
        } else {
            setLoading(false);
        }
        if (user === null) setNotAuth(false);
        else {
            setUserData(user);
        }
    }, [user, USER_STATE.loading]);

    // Clean up the object URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create a temporary URL for preview
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    };

    const handleSave = async () => {
        if (!selectedFile) return;
        setIsSaving(true);

        try {
            // 1. Build FormData
            const formData = new FormData();
            formData.append("avatar", selectedFile);

            // 2. Send to Backend
            const res = await fetch("/api/users/info", {
                method: "POST",
                body: formData,
                // Note: DO NOT set Content-Type header when sending FormData
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Failed to upload avatar");
                return;
            }

            toast.success("Avatar updated!");
            // 3. Refresh global user state to get the new avatar
            await USER_STATE.refresh();
            
            // 4. Clear local upload states
            handleCancel();
            
        } catch (err) {
            console.error(err);
            toast.error("Network error");
        } finally {
            setIsSaving(false);
        }
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "";

    // Safely extract avatar (assuming you added it to your User interface)
    const currentavatar = (user as any)?.avatar;

    return (
        <>
            <div className="bg-background p-5 flex flex-col gap-4 ">
                {loading ? (
                    <div className="text-muted-foreground animate-pulse">Loading...</div>
                ) : (
                    <>
                        <h4 className="text-2xl text-foreground font-semibold font-display">
                            Select Your Avatar
                        </h4>
                        
                        <div
                            className="relative overflow-hidden rounded-[20px] p-5"
                            style={{
                                background: `linear-gradient(160deg, color-mix(in srgb, ${world.color} 10%, var(--card)) 0%, var(--card) 65%)`,
                                border: `1px solid ${world.border}`,
                                boxShadow: `0 0 32px -8px ${world.glow}`,
                            }}
                        >
                            <div
                                className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl"
                                style={{ background: world.glow, opacity: 0.6 }}
                            />
                            <div className="relative flex items-center gap-6">
                                
                                {/* ── BIGGER AVATAR CONTAINER (100px) ── */}
                                <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
                                    {/* Rotating border */}
                                    <div
                                        className="absolute inset-[-3px] rounded-full"
                                        style={{
                                            background: `conic-gradient(${world.color} 0deg, var(--accent) 180deg, ${world.color} 360deg)`,
                                            filter: `drop-shadow(0 0 10px ${world.glow})`,
                                            animation: "orbit-spin 12s linear infinite",
                                        }}
                                    />
                                    
                                    {/* Avatar Image or Icon */}
                                    <div
                                        className="absolute inset-[3px] rounded-full overflow-hidden flex items-center justify-center text-[40px]"
                                        style={{ background: "linear-gradient(145deg, var(--secondary), var(--card))" }}
                                    >
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : currentavatar ? (
                                            <img src={currentavatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            world.icon
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                    <span className="font-display font-bold text-[22px] leading-none tracking-[-0.02em] text-foreground truncate">
                                        @{user?.username}
                                    </span>
                                    <span className="font-body text-[13px] text-muted-foreground truncate">
                                        {user?.email}
                                    </span>
                                    <span className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground/60 mt-1">
                                        Member since {memberSince ? memberSince : "Creation Date"}
                                    </span>
                                </div>
                            </div>

                            {/* ── HIDDEN FILE INPUT ── */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* ── BUTTONS (Change / Save / Cancel) ── */}
                            <div className="relative mt-5 flex gap-2">
                                {selectedFile ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 rounded-xl py-3 text-[13px] font-body font-bold text-white transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
                                            style={{
                                                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                                                boxShadow: "0 0 20px color-mix(in srgb, var(--primary) 40%, transparent)"
                                            }}
                                        >
                                            {isSaving ? "Uploading..." : "Save Avatar"}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="flex-1 rounded-xl py-3 text-[13px] font-body font-bold transition-all active:scale-[0.98] text-muted-foreground hover:text-foreground"
                                            style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full rounded-xl py-3 text-[13px] font-body font-bold transition-all active:scale-[0.98] hover:brightness-125"
                                        style={{
                                            color: world.color,
                                            background: `color-mix(in srgb, ${world.color} 12%, transparent)`,
                                            border: `1px solid ${world.border}`,
                                        }}
                                    >
                                        Change Avatar
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}