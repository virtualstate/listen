/* c8 ignore start */
import {createFetch, dispatchEvent, FetchFn, FetchListenerFn} from "../fetch-listener";
import {randomPort} from "./random-port";

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
    return randomPort();
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

    const url = `http://${hostname}:${port}`;

    return {
        url,
        close,
        fetch: server.fetch?.bind(server) ?? createFetch(url, fn)
    } as const;
    async function close() {
        await server.stop();
    }
}