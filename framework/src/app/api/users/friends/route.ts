import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";
import { or } from "@prisma/orm-postgres/orm-client";
import { dbConnectionStates } from "../search/route";

export interface GetFriendsReturnSttate {
    success: boolean;
    data: null | friendDataStructure[];
}

export interface friendDataStructure {
    userId: string;
    username: string;
    name: string;
    avatar: string;
    world: string;
    path: string;
}

export async function GET(req: NextRequest) {
    try {
        const verification = await authVerify({ req });
        if (!verification.success || !verification.data?.userId) {
            return NextResponse.json<GetFriendsReturnSttate>(
                { success: false, data: null },
                { status: 401 },
            );
        }

        const clientUserId = verification.data.userId;
        const data: friendDataStructure[] = [];

        const connections = await db.orm.public.Connection.where((c: any) =>
            or(c.userAId.eq(clientUserId), c.userBId.eq(clientUserId)),
        ).where((c: any) =>
                c.currentState.eq(dbConnectionStates.connected),
            )
            .include("userA")
            .include("userB")
            .all();

        for (let i = 0; i < connections.length; i++) {
            if (connections[i].userAId === clientUserId && connections[i].currentState == dbConnectionStates.connected) {
                data.push({
                    userId: connections[i].userBId,
                    username: connections[i].userB.username,
                    name: connections[i].userB.name,
                    avatar: connections[i].userB.avatar,
                    world: connections[i].userB.world,
                    path: connections[i].userB.path,
                });
            } else if(connections[i].userBId === clientUserId && connections[i].currentState == dbConnectionStates.connected) {
                data.push({
                    userId: connections[i].userAId,
                    username: connections[i].userA.username,
                    name: connections[i].userA.name,
                    avatar: connections[i].userA.avatar,
                    world: connections[i].userA.world,
                    path: connections[i].userA.path,
                });
            }
        }

        return NextResponse.json<GetFriendsReturnSttate>(
            { success: true, data },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error fetching connections:", err);
        return NextResponse.json<GetFriendsReturnSttate>(
            { success: false, data: null },
            { status: 500 },
        );
    }
}
