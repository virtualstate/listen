import {defer} from "@virtualstate/promise";
import {isPromise, ok} from "../is";

export interface FetchEvent {
    type: "fetch";
    request: Request;
    respondWith(response: Promise<Response> | Response): void
    waitUntil?(promise: Promise<void | unknown>): void
    signal?: {
        aborted: boolean;
    };
    [key: string]: unknown;
    [key: number]: unknown;
}

export interface FetchListenerFn {
    (event: FetchEvent): void | Response | Promise<void | Response>;
}

const globalFetch = fetch;
export type FetchFn = typeof globalFetch;

export interface FetchListener {
    url: string;
    close(): Promise<void>;
    fetch: FetchFn;
}

export interface FetchListenFn {
    (fn: FetchListenerFn): Promise<FetchListener>;
}

const InMemoryFetch = Symbol.for("@virtualstate/listen/fetch/in-memory");

function assertFetch(fetch: FetchFn): asserts fetch is FetchFn & { [InMemoryFetch]?: unknown } {
    ok(fetch);
}

export function isInMemoryFetch(fetch: FetchFn): boolean {
    assertFetch(fetch);
    return !!fetch[InMemoryFetch];
}

export function createFetch(baseURL: string, fn: FetchListenerFn) {
    defineInMemory(fetchInMemory);
    return fetchInMemory;

    function defineInMemory(fn: FetchFn) {
        assertFetch(fn);
        fn[InMemoryFetch] = true;
    }

    async function fetchInMemory(input: Request | RequestInfo | URL, init?: RequestInit) {
        const request = getRequest();
        if (!request.headers.has("Host")) {
            const { host } = new URL(request.url);
            request.headers.set("Host", host);
        }
        if (!request.headers.has("User-Agent")) {
            request.headers.set(
                "User-Agent",
                "internal"
            );
        }
        return dispatchEvent(
            request,
            fn
        );

        function getRequest() {
            if (input instanceof Request) {
                return input;
            }
            if (typeof input === "string" && baseURL) {
                input = new URL(
                    input,
                    baseURL
                );
            }
            return new Request(
                input,
                init
            );
        }
    }
}

export async function dispatchEvent(request: Request, fn: FetchListenerFn): Promise<Response> {
    const deferredResponse = defer<Response>();
    const event: FetchEvent = {
        type: "fetch",
        request,
        respondWith
    };
    const maybe = fn(event);

    /* c8 ignore start */
    if (isPromise(maybe)) {
        maybe
            .then(result => {
                if (result instanceof Response) {
                    respondWith(result);
                }
            })
            .catch(error => void error); // TODO: Note or handle, allows for abort
    } else if (maybe instanceof Response) {
        respondWith(maybe);
    }
    /* c8 ignore end */

    return deferredResponse.promise;

    function respondWith(response: Promise<Response> | Response): void {
        if (isPromise(response)) {
            return void response.then(respondWith);
        }
        deferredResponse.resolve(response)
    }
}