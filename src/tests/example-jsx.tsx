
import { listen, toResponse, toAsyncString, Fetch } from "../listen";
import { h, descendants, name, properties } from "@virtualstate/focus";
import {ok} from "../is";

interface RequestOptions {
    request: Request
}

{
    async function *App({ request }: RequestOptions) {
        if (request.method === "POST") {
            for (let tries = 0; ; tries += 1) {
                try {
                    // console.log({ request, bodyUsed: request.bodyUsed });
                    const body = JSON.parse(
                        await toAsyncString(request)
                    );
                    yield <echo tries={tries} {...body} />
                    return;
                } catch {
                    await new Promise<void>(resolve => setTimeout(resolve, 10));
                }
            }
        }
    }

    const { url, close } = await listen(
        event => event.respondWith(
            toResponse(<App request={event.request} />)
        )
    );

    const random = Math.random()
    const {
        echo: [echo]
    } = descendants(
        <Fetch
            url={url}
            method="POST"
            body={JSON.stringify({
                random
            })}
        />
    ).group(name);
    const body = properties(await echo);
    console.log(body);
    if (body.random !== random) throw new Error("Expected body to contain random");



    await close();
}