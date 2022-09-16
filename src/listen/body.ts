import {toAsyncString} from "./body-string";
import {isArray, ok} from "../is";
import {children} from "@virtualstate/focus";

export function fromBody(body: Body) {

    return children(oneShotRead());

    async function *oneShotRead() {
        let previousPart = "";

        for await (const string of toAsyncString(body)) {
            const parts = parsePart(string);
            yield * parts;
        }

        if (previousPart) {
            yield * parsePart("", false);
        }

        function parsePart(givenPart: string, retry = true) {
            const initialPart = `${previousPart}${givenPart}`;
            let part = initialPart;
            if (part.startsWith(",")) {
                part = part.slice(1);
            }
            if (!part.startsWith("[")) {
                part = `[${part}`;
            }
            if (!part.endsWith("]")) {
                part = `${part}]`
            }
            let parsed;
            try {
                parsed = JSON.parse(part)
                previousPart = "";
            } catch (error) {
                if (!retry) {
                    throw error;
                }
                previousPart = initialPart;
                return [];
            }
            ok(isArray(parsed));
            return parsed;
        }
    }


}