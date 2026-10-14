import { IncomingMessage, ServerResponse } from "http";
export function healthCheckGET(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
        JSON.stringify({
            success: true,
            message: "Resp  onse 200, ok!",
        }),
    );
    return;
}
