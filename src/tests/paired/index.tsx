import {children, descendants, h, isNumber, name, properties, createFragment} from "@virtualstate/focus";
import {Fetch, listen, toResponse} from "../../listen";
import {ok} from "../../is";
import {fromBody} from "../../listen";

const { url, close } = await listen( event => {
    const { request } = event;
    const { method } = request;
    const { body: [body] } = fromBody(request).group(name);

    event.respondWith(toResponse(<Body />));

    async function *Body() {
        if (method === "POST") {
            const { value = 0 } = properties(await body)
            ok(isNumber(value))
            yield <body value={value + 10} />
        } else if (method === "PUT") {
            const { value = 0 } = properties(await body)
            ok(isNumber(value))
            yield <body value={value + 5} />
            yield (
                <>
                    <body value={value + 9} />
                    <body value={2} />
                </>
            )
            yield <body value={value + 6} />
        } else if (method === "GET") {
            yield <body value={1} />
        } else {
            yield <body value={0} />
        }
    }
});

async function logProperties(node: unknown) {
    for await (const snapshot of children(node).map(properties)) {
        console.log(...snapshot);
    }
}

await logProperties(
    <Fetch url={url} />
);
await logProperties(
    <Fetch url={url} method="POST">
        <Fetch url={url} />
    </Fetch>
);
await logProperties(
    <Fetch url={url} method="PUT">
        <Fetch url={url} method="POST">
            <Fetch url={url} />
        </Fetch>
    </Fetch>
);

await close();