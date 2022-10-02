import { listen } from "../../listen/runtime/workerd";
import { toResponse } from "../../listen";
import { h } from "@virtualstate/focus";

async function* App() {
  const startedAt = new Date().toISOString();

  yield <hello>Hello workerd! Started at {startedAt}</hello>;

  for (let i = 1; i <= 3; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield (
      <hello>
        Started at {startedAt}
        workerd updated server side! Updated {i} times Last updated at{" "}
        {new Date().toISOString()}
      </hello>
    );
  }
}

void listen(({ request }) => {
  return toResponse(<App request={request} />);
});
