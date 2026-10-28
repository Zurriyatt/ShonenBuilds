import { NextResponse, NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import { db } from "@/prisma/db";
import { resolveSettings } from "@/lib/user/defaultSettings";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log(body, "body");

        const verify = await authVerify({ req: req, skipStreak: true });
        if (!verify.success) {
            return NextResponse.json({ success: false, message: "Not Logged In!" }, { status: 401 });
        }

        const user = verify.data;

        const resolvedSettings = resolveSettings(body);
        console.log(resolvedSettings);
        await db.orm.public.UserSettings.upsert({
            create: {userId :user?.userId, settings: resolvedSettings },
            update : {settings: resolvedSettings},
            conflictOn : {userId : user?.userId}
        }); 

        return NextResponse.json({ success: true, message: "Settings Updated Successfully!" }, { status: 200 });
    } catch (err) {
        const error = err instanceof Error ? err.message : "Unexpected Error!";
        return NextResponse.json({ success: false, message: error }, { status: 500 });
    }
}
