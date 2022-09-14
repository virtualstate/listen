import {toAsyncString} from "./body-string";
import {isArray, ok} from "../is";
import {children} from "@virtualstate/focus";

export function fromBody(body: Body) {
    return children(oneShotRead());

    async function *oneShotRead() {
        for await (const string of toAsyncString(body)) {
            const parts = parsePart(string);
            yield * parts;
        }
    }

    function parsePart(part: string) {
        if (part.startsWith(",")) {
            part = part.slice(1);
        }
        if (!part.startsWith("[")) {
            part = `[${part}`;
        }
        if (!part.endsWith("]")) {
            part = `${part}]`
        }
        const parsed = JSON.parse(part);
        ok(isArray(parsed));
        return parsed;
    }
}