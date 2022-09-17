import {defer} from "@virtualstate/promise";
import {isPromise, ok} from "../is";

export interface FetchEvent {
    request: Request;
    respondWith(response: Promise<Response> | Response): void
}

export interface FetchListenerFn {
    (event: FetchEvent): void | Response | Promise<void | Response>;
}

const globalFetch = fetch;
export type FetchFn = typeof globalFetch;

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

    async function fetchInMemory(input: RequestInfo | URL, init?: RequestInit) {
        if (typeof input === "string") {
            input = new URL(
                input,
                baseURL
            );
        }
        const request = new Request(
            input,
            init
        );
        return dispatchEvent(
            request,
            fn
        );
    }
}

export async function dispatchEvent(request: Request, fn: FetchListenerFn): Promise<Response> {
    const deferredResponse = defer<Response>();
    const event: FetchEvent = {
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