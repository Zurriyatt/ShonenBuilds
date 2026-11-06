import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import { db } from "@/prisma/db";
import { authVerify } from "@/lib/auth/verify";
import { Temporal } from "temporal-polyfill";
import { DEFAULT_SETTINGS } from "@/lib/user/defaultSettings";
import { v2 as cloudinary } from 'cloudinary';

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const JWT_SECRET = process.env.JWT_SECRET!;
const SESSION_DAYS = 30;
export const saltRoundsP = 10;

export async function POST(request: NextRequest) {
    try {
        // 2. Parse FormData instead of JSON
        const formData = await request.formData();
        
        // 3. Extract strings using formData.get()
        const path = formData.get("path") as string;
        const fullName = formData.get("fullName") as string;
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const goal = formData.get("goal") as string;
        const why = formData.get("why") as string;
        const world = formData.get("world") as string;
        const fingerprint = formData.get("fingerprint") as string;

        // 4. Extract the File
        const avatarFile = formData.get("avatar") as File | null;

        // 5. Validate (same as before)
        let auth = await authVerify({ req: request });
        if (auth.success) {
            return NextResponse.json({ success: false, error: "You are already logged in!" });
        }
        if (!fullName || !username || !email || !password || !goal || !why || !world || !path) {
            return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
        }
        // ... (add your other email/password validations here) ...

        // 6. Check existing
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();
        
        const existing = await db.orm.public.User.where({ email: normalizedEmail }).first();
        const existingByUsername = existing ?? (await db.orm.public.User.where({ username: normalizedUsername }).first());
        
        if (existingByUsername) {
            const field = existingByUsername.email === normalizedEmail ? "Email" : "Username";
            return NextResponse.json({ error: `${field} already taken` }, { status: 409 });
        }

        // 7. Hash password
        const hashedPassword = await bcrypt.hash(password, saltRoundsP);

        // ── CLOUDINARY UPLOAD LOGIC ──
        let avatarUrl = null;

        if (avatarFile && avatarFile.size > 0) {
            // Convert the browser File object to a Node.js Buffer
            const arrayBuffer = await avatarFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload to Cloudinary using upload_stream
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "shonenbuilds_avatars" }, // optional folder in Cloudinary
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                // Pass the buffer into the stream and close it
                uploadStream.end(buffer); 
            });

            // Save the secure URL (HTTPS)
            avatarUrl = (uploadResult as any).secure_url;
        }

        // 8. Create user (now including the avatar URL)
        const user = await db.orm.public.User.create({
            name: fullName,
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            goal,
            path,
            why,
            world,
            avatar: avatarUrl, // 👈 Save the Cloudinary URL to DB
        });

        await db.orm.public.UserSettings.create({
            userId: user.id,
            settings: DEFAULT_SETTINGS,
        });
        
        // 9. Parse device info
        const ua = request.headers.get("user-agent") || "";
        const parser = new UAParser(ua);
        const parsed = parser.getResult();
        const deviceName = parsed.device.model || parsed.device.type || "Desktop";
        const browser = parsed.browser.name ? `${parsed.browser.name} ${parsed.browser.version ?? ""}`.trim() : null;
        const os = parsed.os.name ? `${parsed.os.name} ${parsed.os.version ?? ""}`.trim() : null;

        const geo = (request as any).geo;
        const city = geo?.city ?? null;
        const country = geo?.country ?? null;

        // 10. Create session
        const expiresAt = Temporal.Now.instant().add({ hours: SESSION_DAYS * 24 });
        const session = await db.orm.public.Session.create({
            userId: user.id,
            expiresAt,
            fingerprint: fingerprint ?? null,
            deviceName,
            browser,
            os,
            city,
            country,
        });

        // 11. Sign JWT
        const token = jwt.sign({ userId: user.id, sessionId: session.id, email: user.email }, JWT_SECRET, {
            expiresIn: `${SESSION_DAYS}d`,
        });

        // 12. Response + cookie
        const response = NextResponse.json(
            {
                success: true,
                message: "Account created",
                user: { id: user.id, username: user.username, email: user.email, world: user.world, avatar: avatarUrl },
            },
            { status: 201 },
        );

        response.cookies.set("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: SESSION_DAYS * 24 * 60 * 60,
            path: "/",
        });
        
        return response;

    } catch (err) {
        console.error("Signup error:", err);
        return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }
}