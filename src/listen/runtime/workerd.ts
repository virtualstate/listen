import {createFetch, FetchEvent, FetchListener, FetchListenerFn} from "../fetch-listener";
import {isPromise} from "../../is";
import {randomPort} from "./random-port";

declare var addEventListener:  (name: "fetch", handler: (event: FetchEvent) => void) => void
declare var removeEventListener: (name: string, handler: unknown) => void;

export async function listen(fn: FetchListenerFn): Promise<FetchListener> {

    // Port is internally unknown
    // Url will not be
    const port = randomPort();
    const url = `http://0.0.0.0:${port}`;

    const fetch = createFetch(url, fn);

    addEventListener("fetch", onEvent);

    return {
        url,
        fetch,
        close
    };

    function onEvent(event: FetchEvent) {
        const maybe = fn(event);
        if (isPromise(maybe)) {
            const promise = maybe
                .then(value => {
                    if (value instanceof Response) {
                        event.respondWith(value)
                    }
                })
                .catch(error => void error);
            event.waitUntil(promise);
        }
        if (maybe instanceof Response) {
            event.respondWith(maybe);
        }
    }

    async function close() {
        removeEventListener("fetch", onEvent);
    }
}