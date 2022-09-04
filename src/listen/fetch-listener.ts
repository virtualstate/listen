import {defer} from "@virtualstate/promise";
import {isPromise} from "../is";

export interface FetchEvent {
    request: Request;
    respondWith(response: Promise<Response> | Response): void
}

export interface FetchListenerFn {
    (event: FetchEvent): void;
}

export async function dispatchEvent(request: Request, fn: FetchListenerFn): Promise<Response> {
    const deferredResponse = defer<Response>();
    const event: FetchEvent = {
        request,
        respondWith
    };
    /* c8 ignore start */
    void Promise.resolve(fn(event)).catch(error => void error); // TODO: Note or handle, allows for abort
    /* c8 ignore end */
    return deferredResponse.promise;
    function respondWith(response: Promise<Response> | Response): void {
        if (isPromise(response)) {
            return void response.then(respondWith);
        }
        deferredResponse.resolve(response)
    }
}