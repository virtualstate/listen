import {isRouter, PatternRouteFn, RouteFn, Router} from "@virtualstate/navigation/routes";
import {FetchEvent} from "../listen";
import {URLPattern} from "urlpattern-polyfill";

let router: Router<FetchEvent>;

export function getRouter<E extends FetchEvent, R = Response>(): Router<E, R> {
    if (isRouter<E, R>(router)) {
        return router;
    }
    const local = new Router<E, R>();
    router = local;
    return local;
}

export function route<E extends FetchEvent = FetchEvent, R = Response>(
    pattern: string | URLPattern,
    fn: PatternRouteFn<E, R>
): Router<E, R>;
export function route<E extends FetchEvent = FetchEvent, R = Response>(
    fn: RouteFn<E, R>
): Router<E, R>;
export function route<E extends FetchEvent = FetchEvent, R = Response>(
    ...args: [string | URLPattern, PatternRouteFn<E, R>] | [RouteFn<E, R>]
): Router<E, R> {
    let pattern, fn;
    if (args.length === 1) {
        [fn] = args;
    } else if (args.length === 2) {
        [pattern, fn] = args;
    }
    return routes<E, R>(pattern).route(fn);
}

export function routes<E extends FetchEvent = FetchEvent, R = Response>(
    pattern: string | URLPattern,
    router: Router<E, R>
): Router<E, R>;
export function routes<E extends FetchEvent = FetchEvent, R = Response>(
    pattern: string | URLPattern
): Router<E, R>;
export function routes<E extends FetchEvent = FetchEvent, R = Response>(
    router: Router<E, R>
): Router<E, R>;
export function routes<E extends FetchEvent = FetchEvent, R = Response>(): Router<E, R>;
export function routes<E extends FetchEvent, R>(
    ...args:
        | [string | URLPattern]
        | [string | URLPattern, Router<E, R> | undefined]
        | [Router<E, R> | undefined]
        | []
): Router<E, R> {
    let router: Router<E, R>;
    if (!args.length) {
        router = new Router<E, R>();
        getRouter<E, R>().routes(router);
    } else if (args.length === 1) {
        const [arg] = args;
        if (isRouter<E, R>(arg)) {
            router = arg;
            getRouter<E, R>().routes(router);
        } else {
            const pattern = arg;
            router = new Router();
            getRouter<E, R>().routes(pattern, router);
        }
    } else if (args.length >= 2) {
        const [pattern, routerArg] = args;
        router = routerArg ?? new Router();
        getRouter<E, R>().routes(pattern, router);
    }
    return router;
}

