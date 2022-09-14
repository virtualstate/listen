import {toJSON} from "@virtualstate/focus";

function createPullUnderlyingSourceFromIterable(iterable: AsyncIterable<unknown>): UnderlyingSource {
    const encoder = new TextEncoder();
    let iterator: AsyncIterator<unknown>;
    return {
        start() {
            iterator = iterable[Symbol.asyncIterator]();
        },
        async pull(controller) {
            const { value, done } = await iterator.next();
            if (done) {
                controller.close();
            } else {
                let enqueue = value;
                if (typeof enqueue === "string") {
                    enqueue = encoder.encode(enqueue);
                }
                controller.enqueue(enqueue);
            }
        },
        async cancel() {
            await iterator.return();
        }
    }
}

/**
 * @internal
 */
export function createReadableStreamFromIterable(iterable: AsyncIterable<unknown>) {
    const source = createPullUnderlyingSourceFromIterable(iterable);
    return new ReadableStream(source);
}

async function *toJSONArray(parts: AsyncIterable<string>) {
    yield "[";
    let first = true;
    for await (const part of parts) {
        if (!first) yield ",";
        first = false;
        yield part;
    }
    yield "]";
}

export function toReadableStream(node: unknown) {
    return createReadableStreamFromIterable(
        toJSONArray(
            toJSON(node)
        )
    )
}