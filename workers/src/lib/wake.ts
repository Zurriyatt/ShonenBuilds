import "dotenv/config";
import { IncomingMessage } from "http";
const WAKE_SECRET = process.env.WAKE_SECRET;
if (!WAKE_SECRET) {
    throw new Error("WAKE_SECRET is missing from environment variables");
}
export async function wake(req: IncomingMessage) {
    try {
        const header = req.headers["authorization"] ?? "";
        const expected = `Bearer ${WAKE_SECRET}`;
        if (header === expected) {
            return true;
        }
        return false;
    } catch (err) {
        console.error((err as Error).message);
        return false;
    }
}
