/* c8 ignore start */
import {dispatchEvent, FetchListenerFn} from "../fetch-listener";

interface BunServer {
    stop(): void;
    port: number;
    hostname: string;
}

interface BunFetchOptions {
    fetch(request: Request): Promise<Response>
    port?: number;
}

declare var Bun: {
    env: Record<string, string | undefined>
    exit?(code: number): void;
    serve(options: BunFetchOptions): BunServer
}

function getPort() {
    try {
        const env = Bun.env["PORT"];
        if (env && /^\d+$/.test(env)) {
            return +env;
        }
    } catch {}
    // Example 60019 or 65535
    return 50000 + Math.round(20000 * Math.random());
}

export async function listen(fn: FetchListenerFn) {
    const server = Bun.serve({
        async fetch(request): Promise<Response> {
            return dispatchEvent(
                request,
                fn
            );
        },
        port: getPort()
    });
    const { hostname } = server;
    return {
        url: hostname,
        close
    } as const;
    async function close() {
        await server.stop();
    }
}