/* c8 ignore start */
import {FetchListenerFn} from "../fetch-listener";
import {isPromise} from "../../is";

interface DenoConnection {
    close?(): void;
}

interface DenoServer extends AsyncIterable<DenoConnection>{
    addr: {
        port: number;
    }
    close(): void;
}

interface DenoHTTPEvent {
    request: Request;
    respondWith(response: Response): Promise<void>;
}

interface DenoHttpConnection extends AsyncIterable<DenoHTTPEvent> {
    close(): void;
    nextRequest(): Promise<DenoHTTPEvent | undefined>;
}

declare var Deno: {
    env: {
        get(name: string): string | undefined;
    }
    listen(options: { port: number }): DenoServer
    serveHttp(connection: DenoConnection): DenoHttpConnection
}

function getPort() {
    try {
        const env = Deno.env.get("PORT");
        if (env && /^\d+$/.test(env)) {
            return +env;
        }
    } catch {}
    return 0;
}

export async function listen(fn: FetchListenerFn) {
    const server = Deno.listen({ port: getPort() });
    const hostname = `http://0.0.0.0:${server.addr.port}`
    const abortController = new AbortController();
    const onComplete = (async function watch() {
        for await (const connection of server) {
            void handleConnection(connection).catch(error => void error);
        }

        async function handleConnection(connection: DenoConnection) {
            const http = Deno.serveHttp(connection);
            abortController.signal.addEventListener("abort", () => {
                try {
                    http.close();
                } catch { }
            })
            for await (const event of http) {
                const maybe = fn(event);
                if (isPromise(maybe)) {
                    void maybe
                        .then(result => {
                            if (result instanceof Response) {
                                void event.respondWith(result);
                            }
                        })
                        .catch(error => void error);
                } else if (maybe instanceof Response) {
                    void event.respondWith(maybe)?.catch?.(error => void error)
                }
            }
        }
    })();
    onComplete.catch(error => void error);
    return {
        url: hostname,
        close
    } as const;
    async function close() {
        server.close();
        abortController.abort();

        await onComplete;
    }
}