import { test } from "./test";
import {isInMemoryFetch, listen, toResponse} from "../../listen";
import { h } from "@virtualstate/focus";

export interface AppOptions {
    request: Request
    text?: string
}

export async function *App({ request, text }: AppOptions) {
    console.log("Starting App", request.method, request.url);
    yield <p>Loading {request.url.toString()}!</p>
    await new Promise(resolve => setTimeout(resolve, 500));
    yield <p>Loaded</p>

    if (request.method === "POST") {
        const resolvedText = text ?? await request.text();
        console.log({ resolvedText })
        const body = JSON.parse(resolvedText);
        yield <echo-body {...body} />
    }

    console.log("Finished App", request.method, request.url);
}

const { url, close, fetch } = await listen(async event => {
    let text;
    const { request } = event;
    const { method } = request;
    if (method !== "GET" && method !== "GET") {
        try {
            text = await request.text();
        } catch {}
    }
    event.respondWith(
        toResponse(
            <App
                request={request}
                text={text}
            />
        )
    )
});


await test(App, url);

declare var Bun: unknown;
if (typeof Bun !== "undefined") {
    if (!isInMemoryFetch(fetch) || process.env.BUN_IN_MEMORY_FETCH) {
        console.log("Starting in memory tests", isInMemoryFetch(fetch));
        await test(App, url, fetch);
        console.log("Finished in memory tests");
    }
} else {
    console.log("Starting in memory tests", isInMemoryFetch(fetch));
    await test(App, url, fetch);
    console.log("Finished in memory tests");
}


console.log("Closing server");
await close();
console.log("Closed server");

export default 1;