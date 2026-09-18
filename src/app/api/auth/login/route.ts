// src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import { db } from "@/prisma/db";
import { authVerify } from "@/lib/auth/verify";
import { NextRequest } from "next/server";
const JWT_SECRET = process.env.JWT_SECRET!;
import { Temporal } from "temporal-polyfill";
const SESSION_DAYS = 30;
import { or } from "@prisma/orm-postgres/orm-client";

export interface authToken {
    userId: string;
    sessionId:string;
    email:string;
}
export async function POST(request: NextRequest) {
    try {
        // 1. Parse body — now includes fingerprint
        const body = await request.json();
        const { email, password, fingerprint } = body;

        const auth = await authVerify({ req: request });
        if(auth.success){
            return NextResponse.json({success:false,error:"You are already loggedIN!"}, { status: 400 });
        }
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const identifier = email.toLowerCase().trim();

        const user = await db.orm.public.User.where((user: any) =>
            or(user.email.eq(identifier), user.username.eq(identifier)),
        ).first();

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 4. Parse device info from User-Agent
        const ua = request.headers.get("user-agent") || "";
        const parsed = UAParser(ua);

        const deviceName = parsed.device.model || parsed.device.type || "Desktop";

        const browser = parsed.browser.name ? `${parsed.browser.name} ${parsed.browser.version ?? ""}`.trim() : null;

        const os = parsed.os.name ? `${parsed.os.name} ${parsed.os.version ?? ""}`.trim() : null;

        // 5. Geo (Vercel populates this in production; undefined on localhost)
        const geo = (request as any).geo;
        const city = geo?.city ?? null;
        const country = geo?.country ?? null;

        // 6. Create session in DB
        const expiresAt = Temporal.Instant.fromEpochMilliseconds(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
        const sessionId = crypto.randomUUID();

        const session = await db.orm.public.Session.create({
            id: sessionId,
            userId: user.id,
            expiresAt,
            fingerprint: fingerprint ?? null,
            deviceName,
            browser,
            os,
            city,
            country,
        });

        // 7. Sign JWT
        const token = jwt.sign(
            {
                userId: user.id,
                sessionId: session.id,
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: `${SESSION_DAYS}d` },
        );

        // 8. Set cookie + return
        const response = NextResponse.json({
            message: "Logged in",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                world: user.world,
            },
        });

        response.cookies.set("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: SESSION_DAYS * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
