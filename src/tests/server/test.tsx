/* c8 ignore start */
import {h, descendants, toJSON, name, properties} from "@virtualstate/focus";
import {memo} from "@virtualstate/memo";
import {isArray} from "../../is";
import {union} from "@virtualstate/union";
import {Fetch, toAsyncString} from "../../listen";
import type { App as AppType } from "./index";

const globalFetch = fetch;

export async function test(App: typeof AppType, hostname: string, fetch = globalFetch) {
    const url = new URL("/test", hostname).toString();
    const response = await fetch(url);
    console.log({ status: response.status, ok: response.ok }, response);
    if (!response.ok) {
        console.log(await response.text());
        ok(response.ok, "Response not ok");
    }
    const json = await response.json()
    console.log(json);
    ok(isArray(json));

    {
        console.log(await descendants(json));
    }

    {
        const response = await fetch(url);

        for await (const string of toAsyncString(response)) {
            console.log(string);
        }
    }

    {
        const response = await fetch(url);

        const cached = memo(toAsyncString(response));

        console.log({ bodyUsed: response.bodyUsed });
        // ok(!response.bodyUsed);
        const parts: string[] = [];
        for await (const string of cached) {
            parts.push(string);
        }
        console.log({ bodyUsed: response.bodyUsed, parts });
        ok(parts.length);
        // ok(response.bodyUsed);
        let index = -1;
        for await (const string of cached) {
            index += 1;
            ok(parts[index] === string);
        }
    }

    {
        const root = memo(<Fetch url={url} fetch={fetch} />);

        for await (const snapshot of descendants(root)) {
            console.log(snapshot);
        }

        // Will not hit service again as node is memo'd
        for await (const snapshot of descendants(root).filter(isString)) {
            console.log(snapshot);
        }

    }

    {

        {
            let index = -1;
            for await (const part of toJSON(<Fetch url={url} fetch={fetch} />)) {
                index += 1;
                const string: string = JSON.stringify(json.at(index), undefined, "  ");
                console.log(part, string);
                ok(part === string);
            }
        }

        {
            const left = await toJSON(<App request={new Request(url)} />);
            const right = await toJSON(<Fetch url={url} fetch={fetch} />)
            console.log(left, right);
            ok(left === right);
        }

        {

            {
                const left = toJSON(<App request={new Request(url)} />)[Symbol.asyncIterator]();
                const right = toJSON(<Fetch url={url} fetch={fetch} />)[Symbol.asyncIterator]();

                let leftResult,
                    rightResult;

                do {
                    ([
                        leftResult,
                        rightResult
                    ] = await Promise.all([
                        left.next(),
                        right.next()
                    ]));

                    console.log({
                        leftResult,
                        rightResult

                    });

                    if (leftResult.value && rightResult.value) {
                        ok(leftResult.value === rightResult.value)
                    } else {
                        ok(leftResult.done);
                        ok(rightResult.done);
                    }

                } while (!leftResult.done && !rightResult.done)
            }

            {
                for await (
                    const entries of union([
                    indexed(toJSON(<App request={new Request(url)} />)),
                    indexed(toJSON(<Fetch url={url} fetch={fetch} />))
                ])
                    ) {
                    if (entries.length < 2) continue;
                    if (!entries.every((entry) => entry && entries[0][0] === entry[0])) continue;

                    const values = entries.map(([,value]) => value);
                    console.log(...entries);
                    ok(values.every(value => value === values[0]));

                }

                async function *indexed<T>(async: AsyncIterable<T>) {

                    let index = -1;
                    for await (const snapshot of async) {
                        index += 1;
                        yield [index, snapshot] as const;
                    }

                }
            }

        }
    }

    {
        const random = Math.random();
        const {
            "echo-body": [echo]
        } = descendants(
            <Fetch
                fetch={fetch}
                url={new URL("/example/post", hostname)}
                method="POST"
                body={JSON.stringify({
                    a: random
                })}
            />
        ).group(name)
        const { a } = properties(await echo);
        console.log({ a, random });
        ok(a === random);
    }

    console.log("Finished JSX server tests");
}

export function ok(
    value: unknown,
    message?: string
): asserts value;
export function ok<T>(
    value: unknown,
    message?: string
): asserts value is T;
export function ok(
    value: unknown,
    message?: string
): asserts value {
    if (!value) {
        console.log({
            value,
            message
        });
        throw new Error(message ?? "Expected value");
    }
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}