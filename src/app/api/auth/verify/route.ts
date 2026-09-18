// src/app/api/auth/session/route.ts

import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";

export async function GET(request: NextRequest) {
    try {
        const result = await authVerify({ req: request });
      console.log(result)
        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        }

        return NextResponse.json({ success: false, data: null }, { status: 401 });
    } catch (err) {
        return NextResponse.json(
            {
                success: false,
                data: null,
                error: err instanceof Error ? err.message : "Server error",
            },
            { status: 500 }
        );
    }
}