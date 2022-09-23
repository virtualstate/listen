import {createFetch, FetchListenerFn} from "../fetch-listener";
import {randomPort} from "./random-port";

interface AbortError extends Error {
    // Shown here
    // https://dom.spec.whatwg.org/#aborting-ongoing-activities
    // https://webidl.spec.whatwg.org/#aborterror
    name: "AbortError";
}

class AbortError extends Error {
    constructor(message?: string) {
        super(`AbortError${message ? `: ${message}` : ""}`);
        this.name = "AbortError";
    }
}

export async function listen(fn: FetchListenerFn) {
    const port = randomPort();
    const url = `http://0.0.0.0:${port}`;
    const abortController = new AbortController();
    return {
        url,
        fetch: createFetch(url, event => {
            if (abortController.signal.aborted) {
                throw new AbortError();
            }
            return fn(event);
        }),
        close: abortController.abort.bind(abortController)
    };
}