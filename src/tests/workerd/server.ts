import { listen } from "../../listen/runtime/workerd";

void listen( ({ request }) => {
    return new Response(
        JSON.stringify({
            method: request.method,
            url: request.url
        }),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
});