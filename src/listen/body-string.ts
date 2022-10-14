import { TheAsyncThing, anAsyncThing } from "@virtualstate/promise/the-thing";
import {isAsyncIterable, ok} from "../is";

export function toAsyncString(input: Body): TheAsyncThing<string> {
  return anAsyncThing(createIterable());

  function createIterable() {
    /* c8 ignore start */ // bun < 0.1.14 only
    if (!input.body?.pipeThrough) {
      return {
        async *[Symbol.asyncIterator]() {
          yield input.text();
        },
      };
    }
    /* c8 ignore end */
    return {
      async *[Symbol.asyncIterator]() {
        const decoder = new TextDecoder();
        for await (const value of toAsyncIterable(input.body)) {
          yield decoder.decode(value);
        }
      },
    };
  }
}

function toAsyncIterable(input: ReadableStream) {
  if (isAsyncIterable<Uint8Array>(input)) {
    return input;
  }
  return {
    [Symbol.asyncIterator](): AsyncIterator<Uint8Array> {
      const reader = input.getReader();
      return {
        next() {
          const promise = reader.read();
          ok<Promise<IteratorResult<Uint8Array>>>(promise);
          return promise;
        },
        async return() {
          reader.releaseLock()
          return { done: true, value: undefined }
        },
        async throw(error: unknown) {
          await reader.cancel(error)
          return { done: true, value: undefined }
        }
      }
    }
  }
}