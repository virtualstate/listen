import {defer} from "@virtualstate/promise";
import {isPromise} from "../is";

export interface FetchEvent {
    request: Request;
    respondWith(response: Promise<Response> | Response): void
}

export interface FetchListenerFn {
    (event: FetchEvent): void | Response | Promise<void | Response>;
}

export async function dispatchEvent(request: Request, fn: FetchListenerFn): Promise<Response> {
    const deferredResponse = defer<Response>();
    const event: FetchEvent = {
        request,
        respondWith
    };
    const maybe = fn(event);

    /* c8 ignore start */
    if (isPromise(maybe)) {
        maybe
            .then(result => {
                if (result instanceof Response) {
                    respondWith(result);
                }
            })
            .catch(error => void error); // TODO: Note or handle, allows for abort
    } else if (maybe instanceof Response) {
        respondWith(maybe);
    }
    /* c8 ignore end */

    return deferredResponse.promise;

    function respondWith(response: Promise<Response> | Response): void {
        if (isPromise(response)) {
            return void response.then(respondWith);
        }
        deferredResponse.resolve(response)
    }
}