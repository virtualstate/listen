import {TheAsyncThing, anAsyncThing} from "@virtualstate/promise/the-thing";

export function toAsyncString(input: Body): TheAsyncThing<string> {
    return anAsyncThing(createIterable());

    function createIterable() {
        /* c8 ignore start */ // bun only
        if (typeof TextDecoderStream === "undefined" || !input.body?.pipeThrough) {
            return {
                async *[Symbol.asyncIterator]() {
                    yield input.text();
                }
            }
        }
        /* c8 ignore end */
        return {
            async *[Symbol.asyncIterator]() {
                const stream = input.body.pipeThrough(new TextDecoderStream());
                const reader = stream.getReader();
                let result;
                try {
                    do {
                        result = await reader.read();
                        if (result.value) {
                            yield result.value
                        }
                    } while (!result.done);
                } finally {
                    reader.releaseLock()
                }
            }
        }
    }
}