import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";
import { dbConnectionStates } from "../search/route";
export interface RespondConnectionReturnState {
    success: boolean;
    message: string;
}

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Auth -> 401
        const verification = await authVerify({ req });
        if (!verification.success || !verification.data?.userId) {
            return NextResponse.json<RespondConnectionReturnState>(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const clientUserId = verification.data.userId;
        const body = await req.json();
        const targetUserId: string | undefined = body?.targetUserId?.trim();
        const action: "accept" | "reject" | undefined = body?.action;

        // 2. Validate Payload -> 400
        if (!targetUserId || (action !== "accept" && action !== "reject")) {
            return NextResponse.json<RespondConnectionReturnState>(
                { success: false, message: "Invalid request payload" },
                { status: 400 },
            );
        }

        if (clientUserId === targetUserId) {
            return NextResponse.json<RespondConnectionReturnState>(
                { success: false, message: "Cannot respond to yourself" },
                { status: 400 },
            );
        }

        // 3. Backend Lexicographical Sort (Never trust frontend order)
        const [IdA, IdB] =
            targetUserId > clientUserId
                ? [clientUserId, targetUserId]
                : [targetUserId, clientUserId];

        // 4. Find Existing Connection -> 404
        const connection = await db.orm.public.Connection.where({
            userAId: IdA,
            userBId: IdB,
        }).first();

        if (!connection) {
            return NextResponse.json<RespondConnectionReturnState>(
                { success: false, message: "Connection request not found" },
                { status: 404 },
            );
        }

        // 5. State & Ownership Guards -> 400 / 403
        if (connection.currentState !== dbConnectionStates.pending) {
            return NextResponse.json<RespondConnectionReturnState>(
                { success: false, message: "This request is no longer pending" },
                { status: 400 },
            );
        }

        // Only the person who RECEIVED the request can accept or reject it
        if (connection.requestedBy === clientUserId) {
            return NextResponse.json<RespondConnectionReturnState>(
                { success: false, message: "You cannot accept or reject your own sent request" },
                { status: 403 },
            );
        }

        // 6. Update State using your universal dbConnectionStates object -> 200
        const nextState =
            action === "accept"
                ? dbConnectionStates.connected
                : dbConnectionStates.rejected;

        await db.orm.public.Connection.where({
            userAId: IdA,
            userBId: IdB,
        }).update({
            currentState: nextState,
        });

        return NextResponse.json<RespondConnectionReturnState>(
            {
                success: true,
                message:
                    action === "accept"
                        ? "Friend request accepted!"
                        : "Friend request rejected.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Respond connection error:", error);
        return NextResponse.json<RespondConnectionReturnState>(
            { success: false, message: "Internal server error" },
            { status: 500 },
        );
    }
}
