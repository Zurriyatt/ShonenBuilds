import { NextRequest } from "next/server";
import { authVerify } from "@/lib/auth/verify";
import bcrypt from "bcryptjs";
import { db } from "@/prisma/db";
import { saltRoundsP } from "../signup/route";
export const qwertyOnlyRegex = /^[ -~]*$/; // declare + export
const headersData = {
    "Content-Type": "application/json",
    "X-Raw-Response": "true",
};
export async function POST(req: NextRequest): Promise<Response> {
    try {
        //body parse
        // 1. Parse the raw incoming JSON object safely
        const body = await req.json();

        // 2. Safely read properties out of the body object
        const currentPassword = body?.currentPassword;
        const newPassword = body?.newPassword;
        const signOutOthers = body?.signOutOthers;

    

        // 3. DEFENSIVE CHECK: Stop execution immediately if data is missing or empty
        if (!currentPassword || !newPassword) {
            return new Response(JSON.stringify({ success: false, message: "Invalid payload parameters provided." }), {
                status: 400,
                headers: headersData,
            });
        }

        //auth verify
        const verify = await authVerify({ req });
        if (!verify.success) {
            return new Response(JSON.stringify({ success: false, message: "Login your account!" }), {
                //gamified term for unauthorized for better frontend understanding
                status: 401,
                headers: headersData,
            });
        }
        const user = verify.data;

        //verify format of password
        if (!qwertyOnlyRegex.test(currentPassword)) {
            return new Response(JSON.stringify({ success: false, message: "Incorrect Current Password format!" }), {
                status: 400, //Invalid data from frontend!
                headers: headersData,
            });
        }
        if (!qwertyOnlyRegex.test(newPassword)) {
            return new Response(JSON.stringify({ success: false, message: "Incorrect Updated Password format!" }), {
                status: 400,
                headers: headersData,
            });
        }

        //get things from db

        const userData = await db.orm.public.User.where({ email: user?.email }).first();
        const originalPass = userData?.password;
        console.log(originalPass)
        if(!userData.password){
          return new Response(JSON.stringify({ success: false, message: "User doesnt Exist!" }), {
                status: 401,
                headers: headersData,
            });
        };
        //pass the data to bcrypt to check based on it return or not
        const compare = await bcrypt?.compare(currentPassword, originalPass);
        if (!compare) {
            return new Response(JSON.stringify({ success: false, message: "Invalid Password!" }), {
                status: 401,
                headers: headersData,
            });
        }

        //if passed chance the pass and delete all other sessions beside the current one
        const newPass = await bcrypt?.hash(newPassword, saltRoundsP);

        await db.orm.public.User.where({ email: user?.email }).update({ password: newPass });
        if (signOutOthers) {
            await db.orm.public.Session.where({ userId: user?.userId }).deleteAll();
        }
        // in the end return the success
        return new Response(JSON.stringify({ success: true, message: "Passwrod Updated, Now Relogin!" }), {
            //gamified term for unauthorized for better frontend understanding
            status: 200,
            headers: headersData,
        });
    } catch (err) {
        console.log(err instanceof Error ? err.message : "unknown error!");
        return new Response(JSON.stringify({ success: false, message: "Internal Error!" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "X-Raw-Response": "true",
            },
        });
    }
}
