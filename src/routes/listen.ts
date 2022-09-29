import {FetchEvent, listen as core} from "../listen";
import {getRouter} from "./route";
import {Router, transitionEvent} from "@virtualstate/navigation/routes";

export function createListener(router = getRouter()) {
    const resolver = new Router<FetchEvent>();
    resolver.routes(router);
    return async function routerFetchListener(event: FetchEvent) {
        resolver.then(response => {
            if (response instanceof Response) {
                event.respondWith(response);
            }
        });
        await transitionEvent(resolver, event);
    }
}

export function listen(router = getRouter()) {
    return core(createListener(router));
}