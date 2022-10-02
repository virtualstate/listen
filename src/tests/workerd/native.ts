import type {FetchEvent} from "../../listen";

declare var addEventListener:  (name: "fetch", handler: (event: FetchEvent) => void) => void
declare var removeEventListener: (name: string, handler: unknown) => void;

addEventListener("fetch", (event) => {
    const { request } = event;
    event.respondWith(new Response(
        JSON.stringify({
            method: request.method,
            url: request.url
        }),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    ));
});