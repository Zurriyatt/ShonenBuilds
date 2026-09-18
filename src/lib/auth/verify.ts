import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/prisma/db";
import { authToken } from "@/app/api/auth/login/route";
import { resourceUsage } from "process";
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables");
}
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
export async function authVerify({ req }: { req: NextRequest }) {
    try {
        const cookieStore = await cookies();
        let cookieToken = cookieStore.get("authToken");
        if (!cookieToken) return { success: false, data: null };
        let Token = jwt.verify(cookieToken.value, JWT_SECRET) as authToken;
        if (Token) {
            const user = await db.orm.public.User.where({ id: Token.userId }).first();
            if (user) {
                const session = await db.orm.public.Session.where({ id: Token.sessionId }).first();
                
                if (!session) {
                    return { success: false, data: null, error: "You are not logged in!" };
                }

               if (session.expiresAt.epochMilliseconds <= Date.now()) {
                    await db.orm.public.Session.delete({ id: session.id });
                    return { success: false, data: null, error: "Login expired!" };
                }
                const rank = await db.orm.public.Rank.where({ userId: user.id }).first();
                if(!rank){
                    return {success:false,error:"Your Rank is missing!"}
                }
                return {
                    success: true,
                    data: {
                        userId: user.id,
                        email: user.email,
                        sessionId: session.id,
                        name: user.name,
                        username: user.username,
                        rank: rank.rank,
                        why: user.why,
                        goal: user.goal,
                        world: user.world,
                    },
                };
            } else {
                return {
                    success: false,
                    data: null,
                    error: "You are not loggedIN!",
                };
            }
        }
        return { success: false, data: null, error: "You are not loggedIN!" };
    } catch (err) {
        let error = "Server Error!";
        if (err instanceof Error) {
            error = err.message;
        }
        return { success: false, error: error, data: null };
    }
}
