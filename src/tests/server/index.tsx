import { test } from "./test";
import {
  FetchListenFn,
  isInMemoryFetch,
  listen, respondWith,
  toResponse,
} from "../../listen";
import { listen as memory } from "../../listen/runtime/memory";
import { h } from "@virtualstate/focus";

export interface AppOptions {
  request: Request;
  text?: string;
}

export async function* App({ request, text }: AppOptions) {
  console.log("Starting App", request.method, request.url);
  yield <p>Loading {request.url.toString()}!</p>;
  await new Promise((resolve) => setTimeout(resolve, 500));
  yield <p>Loaded</p>;

  if (request.method === "POST") {
    const resolvedText = text ?? (await request.text());
    console.log({ resolvedText });
    const body = JSON.parse(resolvedText);
    yield <echo-body {...body} />;
  }

  console.log("Finished App", request.method, request.url);
}

async function runTest(listen: FetchListenFn) {
  const { url, close, fetch } = await listen(async (event) => {
    let text;
    const { request } = event;
    const { method } = request;
    if (method !== "GET" && method !== "OPTIONS") {
      try {
        text = await request.text();
      } catch {}
    }
    respondWith(event, <App request={request} text={text} />);
  });

  console.log("Starting in memory tests", isInMemoryFetch(fetch));
  await test(App, url, fetch);
  console.log("Finished in memory tests");

  if (typeof window === "undefined" && listen !== memory) {
    await test(App, url);
  }

  console.log("Closing server");
  await close();
  console.log("Closed server");
}

await runTest(memory);
await runTest(listen);

export default 1;
