import { listen } from "../../listen/runtime/workerd";
import {toResponse} from "../../listen";
import {h} from "@virtualstate/focus";
import {createFetch, route} from "../../routes";

async function *App() {
    const startedAt = new Date().toISOString();

    yield (
        <hello>
            Hello workerd!
            Started at {startedAt}
        </hello>
    )

    for (let i = 1; i <= 3; i += 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        yield (
            <hello>
                Started at {startedAt}

                workerd updated server side!

                Updated {i} times

                Last updated at {new Date().toISOString()}
            </hello>
        );
    }



}

route("/", ({ request }) => toResponse(<App request={request} />));

export default {
    fetch: createFetch()
}
