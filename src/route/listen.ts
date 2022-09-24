import {FetchEvent, listen as core} from "../listen";
import {getRouter} from "./route";
import {Router, transitionEvent} from "@virtualstate/navigation/routes";

export function listen() {
    return core(async (event) => {
        const router = new Router<FetchEvent>();
        router.routes(getRouter());
        router.then(response => {
            if (response instanceof Response) {
                event.respondWith(response);
            }
        });
        await transitionEvent(router, event);
    });
}