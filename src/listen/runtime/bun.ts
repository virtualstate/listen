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
    exit?(code: number): void;
    serve(options: BunFetchOptions): BunServer
}

export async function listen(fn: FetchListenerFn) {
    const server = Bun.serve({
        async fetch(request): Promise<Response> {
            return dispatchEvent(
                request,
                fn
            );
        }
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