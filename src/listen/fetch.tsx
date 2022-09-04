import {toAsyncString} from "./body-string";
import {h} from "@virtualstate/focus";
import {isArray, ok} from "../is";

const DEFAULT_RETRIES = 3;

export interface FetchOptions extends RequestInit {
    url: URL | string
    retries?: number;
    isRetry?: boolean;
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

export async function *Fetch(options: FetchOptions): AsyncIterable<unknown> {
    const { retries, url } = options;
    const response = await fetch(url.toString(), options);

    /* c8 ignore start */ // flaky servers only
    if (!response.ok) {
        if (typeof retries !== "number") {
            return yield <Fetch {...options} retries={DEFAULT_RETRIES} isRetry />;
        } else if (retries > 0) {
            return yield <Fetch {...options} retries={retries - 1} isRetry />;
        } else {
            throw new FetchResponseError(response);
        }
    }
    /* c8 ignore end */

    for await (const string of toAsyncString(response)) {
        yield * parsePart(string);
    }

    function parsePart(part: string) {
        if (part.startsWith(",")) {
            part = part.slice(1);
        }
        if (!part.startsWith("[")) {
            part = `[${part}`;
        }
        if (!part.endsWith("]")) {
            part = `${part}]`
        }
        const parsed = JSON.parse(part);
        ok(isArray(parsed));
        return parsed;
    }
}