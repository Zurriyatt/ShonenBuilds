import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/prisma/db";
import { authToken } from "@/app/api/auth/login/route";

const JWT_SECRET = process.env.JWT_SECRET!;

/* =========================================================
   POST /api/auth/logout

   Clears the auth cookie and (optionally) deletes the
   session row from the DB.
   ========================================================= */

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get("authToken");

        /* ── 1. If there's a valid token, delete the session ── */
        if (cookieToken) {
            try {
                const Token = jwt.verify(cookieToken.value, JWT_SECRET) as authToken;

                if (Token?.sessionId) {
                    await db.orm.public.Session
                        .where({ id: Token.sessionId })
                        .delete();
                }
            } catch {
                
            }
        }

        /* ── 2. Clear the cookie ────────────────────────────── */
        const response = NextResponse.json({
            success: true,
            message: "Logged out",
        });

        response.cookies.set("authToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("Logout error:", err);
        return NextResponse.json(
            { success: false, error: "Something went wrong" },
            { status: 500 },
        );
    }
}
