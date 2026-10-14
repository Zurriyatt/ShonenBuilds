import { IncomingMessage, ServerResponse } from "http";
import http from "http";
import { wake } from "./wake.js";
export class customHandle {
    public server: http.Server;
    private route: Record<string, Record<string, (req: IncomingMessage, res: ServerResponse) => void>>;
    constructor() {
        this.route = { get: {}, post: {}, put: {}, delete: {} };
        this.server = http.createServer(async (req, res) => {
            try {
                const { method, url } = req;
                const secureAwake = await wake(req);
                if (secureAwake) {
                    const methodKey = method?.toLowerCase();
                    const handler = this.route[methodKey as string][url as string];
                    if (handler) {
                        handler(req, res);
                    } else {
                        res.writeHead(404, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Not found" }));
                    }
                } else {
                    res.writeHead(401, { "content-type": "application/json" });
                    res.end(JSON.stringify({ error: "Not Authorized!" }));
                }
            } catch (err) {
                console.error({ error: "Server Catch ", message: err instanceof Error ? err.message : err });
                if (!res.headersSent) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Internal server error" }));
                }
            }
        });
    }
    public listen(PORT: number, callback: () => void) {
        this.server.listen(PORT, callback);
    }
    public get(path: string, callback: (req: IncomingMessage, res: ServerResponse) => void) {
        this.route["get"][path] = callback;
    }
    public post(path: string, callback: (req: IncomingMessage, res: ServerResponse) => void) {
        this.route["post"][path] = callback;
    }
    public put(path: string, callback: (req: IncomingMessage, res: ServerResponse) => void) {
        this.route["put"][path] = callback;
    }
    public delete(path: string, callback: (req: IncomingMessage, res: ServerResponse) => void) {
        this.route["delete"][path] = callback;
    }
}