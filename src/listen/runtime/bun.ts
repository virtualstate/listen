/* c8 ignore start */
import {createFetch, dispatchEvent, FetchFn, FetchListenerFn} from "../fetch-listener";
import {ok} from "../../is";

interface BunServer {
    stop(): void;
    port: number;
    hostname: string;
    fetch?: FetchFn
}

interface BunFetchOptions {
    fetch(request: Request): Promise<Response>
    port?: number;
    hostname?: string;
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
    const hostname = `0.0.0.0`;
    const server = Bun.serve({
        async fetch(request): Promise<Response> {
            return dispatchEvent(
                request,
                fn
            );
        },
        hostname,
        port: getPort()
    });

    const { port } = server

    const url = `http://0.0.0.0:${port}`;

    return {
        url,
        close,
        fetch: server.fetch ?? createFetch(url, fn)
    } as const;
    async function close() {
        await server.stop();
    }
}