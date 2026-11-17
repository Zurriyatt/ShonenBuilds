import { db } from "@/prisma/db";
import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";

export enum ConnectionState {
    NONE = "NONE",
    OUTGOING_PENDING = "OUTGOING_PENDING",
    INCOMING_PENDING = "INCOMING_PENDING",
    CONNECTED = "CONNECTED",
}

export const dbConnectionStates = {
    pending: "pending",
    connected: "connected",
    rejected: "rejected",
} as const;

export interface ConnectionResponse {
    success: boolean;
    message: string;
    connectionStatus: ConnectionState;
    data?: unknown;
}

export async function POST(req: NextRequest) {
    try {
        const auth = await authVerify({ req });
        if (!auth.success || !auth.data?.userId) {
            return NextResponse.json<ConnectionResponse>(
                { success: false, message: "You are not logged in!", connectionStatus: ConnectionState.NONE },
                { status: 401 }
            );
        }

        const body = await req.json();
        let username = body?.username?.trim();
        const senderId = auth.data.userId;
        
        if (!username) {
            return NextResponse.json<ConnectionResponse>(
                { success: false, message: "Username is required", connectionStatus: ConnectionState.NONE },
                { status: 400 }
            );
        }
        if(username[0] == '@'){
            username = username.slice(1, username.length)
            if (username.length ==0) {
            return NextResponse.json<ConnectionResponse>(
                { success: false, message: "Username is required", connectionStatus: ConnectionState.NONE },
                { status: 400 }
            );
        }
        }
        const user = await db.orm.public.User.where({ username })
            .select("id", "username", "name", "avatar")
            .first();

        if (!user) {
            return NextResponse.json<ConnectionResponse>(
                { success: false, message: "User not found", connectionStatus: ConnectionState.NONE },
                { status: 404 }
            );
        }

        const receiverId = user.id;

        if (senderId === receiverId) {
            return NextResponse.json<ConnectionResponse>(
                { success: false, message: "You cannot connect with yourself", connectionStatus: ConnectionState.NONE },
                { status: 400 }
            );
        }

        // Lexicographical sorting
        const [IdA, IdB] = receiverId > senderId ? [senderId, receiverId] : [receiverId, senderId];

        const currReq = await db.orm.public.Connection.where({ userAId: IdA, userBId: IdB }).first();

        if (currReq) {
            // Note: ensure `status` matches your exact DB column name
            if (currReq.currentState  === dbConnectionStates.connected) {
                return NextResponse.json<ConnectionResponse>(
                    { success: true, message: "You are already connected!", connectionStatus: ConnectionState.CONNECTED },
                    { status: 200 }
                );
            }

            if (currReq.currentState  === dbConnectionStates.pending) {
                // Other person already sent request -> auto-accept
                if (currReq.requestedBy === receiverId) {
                    await db.orm.public.Connection.where({ userAId: IdA, userBId: IdB }).update({
                        currentState : dbConnectionStates.connected,
                    });

                    return NextResponse.json<ConnectionResponse>(
                        {
                            success: true,
                            message: "They already sent you a request, their request was accepted!",
                            data: user,
                            connectionStatus: ConnectionState.CONNECTED,
                        },
                        { status: 200 }
                    );
                }

                // Current user already sent request
                return NextResponse.json<ConnectionResponse>(
                    { success: true, message: "Friend request already pending!", connectionStatus: ConnectionState.OUTGOING_PENDING },
                    { status: 200 }
                );
            }

            // If previously rejected, update existing row back to pending
            await db.orm.public.Connection.where({ userAId: IdA, userBId: IdB }).update({
                requestedBy: senderId,
                currentState : dbConnectionStates.pending,
            });
        } else {
            // No prior record -> create new row
            await db.orm.public.Connection.create({
                userAId: IdA,
                userBId: IdB,
                requestedBy: senderId,
                currentState : dbConnectionStates.pending,
            });
        }

        return NextResponse.json<ConnectionResponse>(
            { success: true, message: "Friend Request Sent!", data: user, connectionStatus: ConnectionState.OUTGOING_PENDING },
            { status: 201 }
        );
    } catch (error) {
        console.error("Friend request error:", error);
        return NextResponse.json<ConnectionResponse>(
            { success: false, message: "Internal server error", connectionStatus: ConnectionState.NONE },
            { status: 500 }
        );
    }
}
