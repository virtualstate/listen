import {toJSON} from "@virtualstate/focus";
import {fromBody} from "./body";
import {FetchFn} from "./fetch-listener";

const DEFAULT_RETRIES = 3;

const globalFetch = fetch;

export interface FetchOptions extends RequestInit {
    url: URL | string
    retries?: number;
    isRetry?: boolean;
    fetch?: FetchFn;
}

/* c8 ignore start */ // flaky servers only
class FetchResponseError extends Error {

    response: Response;
    status: number;

    constructor(response: Response, message = "Failed to fetch") {
        super(message);
        this.response = response;
        this.status = response.status;
    }
}
/* c8 ignore end */

export async function *Fetch(options: FetchOptions, input?: unknown): AsyncIterable<unknown> {
    if ("body" in options || options.body) {
        return yield * withOptions(options);
    }

    const method = (options.method ?? "GET").toString();

    if (method !== "PUT" && method !== "POST" && method !== "PATCH") {
        return yield * withOptions(options);
    }

    let fetched = false;
    for await (const snapshot of toJSON(input)) {
        yield * withOptions({
            ...options,
            body: snapshot
        })
        fetched = true;
    }

    if (!fetched) {
        yield * withOptions(options);
    }

    async function * withOptions(options: FetchOptions): AsyncIterable<unknown> {
        const { url, retries, fetch = globalFetch } = options;
        const response = await fetch(url.toString(), options);
        /* c8 ignore start */ // flaky servers only
        if (!response.ok) {
            if (typeof retries !== "number") {
                return yield * withOptions({
                    ...options,
                    retries: DEFAULT_RETRIES
                })
            } else if (retries > 0) {
                return yield * withOptions({
                    ...options,
                    retries: retries - 1,
                    isRetry: true
                });
            } else {
                throw new FetchResponseError(response);
            }
        }
        /* c8 ignore end */
        yield * fromBody(response);
    }

}