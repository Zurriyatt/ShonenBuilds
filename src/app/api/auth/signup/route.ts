    import { NextResponse, NextRequest} from "next/server";
    import bcrypt from "bcryptjs";
    import jwt from "jsonwebtoken";
    import { UAParser } from "ua-parser-js";
    import { db } from "@/prisma/db";
    import { authVerify } from "@/lib/auth/verify";
    import { Temporal } from "temporal-polyfill";
    const JWT_SECRET = process.env.JWT_SECRET!;


    const SESSION_DAYS = 30;
    export async function POST(request: NextRequest) {
        try {
            const body = await request.json();
            const { path, fullName, username, email, password, goal, why, world, fingerprint } = body;
            // 1. Validate
            let auth = await authVerify({ req: request });
            if(auth.data) {
                return NextResponse.json({ success: false, error: "You are already loggedin!" });
            }
            if (!fullName || !username || !email || !password || !goal || !why || !world || !path) {
                return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
            }
            if (!email.includes("@") || !email.includes(".")) {
                return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
            }
            if (username.length < 3) {
                return NextResponse.json(
                    { success: false, error: "Username must be at least 3 characters" },
                    { status: 400 },
                );
            }
            if (password.length < 8) {
                return NextResponse.json(
                    { success: false, error: "Password must be at least 8 characters" },
                    { status: 400 },
                );
            }

            // 2. Normalize
            const normalizedEmail = email.toLowerCase().trim();
            const normalizedUsername = username.toLowerCase().trim();
            // 3. Check existing
            const existing = await db.orm.public.User.where({ email: normalizedEmail }).first();
            const existingByUsername =
                existing ?? (await db.orm.public.User.where({ username: normalizedUsername }).first());
            if (existingByUsername) {
                const field = existingByUsername.email === normalizedEmail ? "Email" : "Username";
                return NextResponse.json({ error: `${field} already taken` }, { status: 409 });
            }

            // 4. Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate application-level UUID for the user string ID
            // const userId = crypto.randomUUID(); backup if needed after runtime crash

            // 5. Create user + rank
            const user = await db.orm.public.User.create({
                name: fullName,
                username: normalizedUsername,
                email: normalizedEmail,
                password: hashedPassword,
                goal,
                path,
                why,
                world,
            });

            await db.orm.public.UserStats.create({
                userId: user.id,
            });
            // 6. Parse device info
            const ua = request.headers.get("user-agent") || "";
            const parser = new UAParser(ua); // Fixed: Correct initialization pattern for newer ua-parser-js versions
            const parsed = parser.getResult();
            const deviceName = parsed.device.model || parsed.device.type || "Desktop";
            const browser = parsed.browser.name ? `${parsed.browser.name} ${parsed.browser.version ?? ""}`.trim() : null;
            const os = parsed.os.name ? `${parsed.os.name} ${parsed.os.version ?? ""}`.trim() : null;

            const geo = (request as any).geo;
            const city = geo?.city ?? null;
            const country = geo?.country ?? null;

            // 7. Create session
            const expiresAt = Temporal.Now.instant().add({ hours: SESSION_DAYS*24 });

            // const sessionId = crypto.randomUUID(); left for runtime behavior we will adapt according to it
            const session = await db.orm.public.Session.create({
                userId: user.id, // Successfully matches your active String relation
                expiresAt,
                fingerprint: fingerprint ?? null,
                deviceName,
                browser,
                os,
                city,
                country,
            });

            // 8. Sign JWT
            const token = jwt.sign({ userId: user.id, sessionId: session.id, email: user.email }, JWT_SECRET, {
                expiresIn: `${SESSION_DAYS}d`,
            });

            // 9. Response + cookie
            const response = NextResponse.json(
                {
                    success: true,
                    message: "Account created",
                    user: { id: user.id, username: user.username, email: user.email, world: user.world },
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
