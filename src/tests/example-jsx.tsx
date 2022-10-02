/* c8 ignore start */
import { listen, toResponse, Fetch } from "../listen";
import { h, descendants, name, properties } from "@virtualstate/focus";

interface RequestOptions {
  request: Request;
}

{
  async function* App({ request }: RequestOptions) {
    const texts = [];
    if (request.method === "POST") {
      for (let tries = 0; ; tries += 1) {
        try {
          console.log({ request, bodyUsed: request.bodyUsed, tries });
          const text = await request.text();
          texts.push(text);
          const body = JSON.parse(text);
          yield <echo tries={tries} texts={texts} {...body} />;
          return;
        } catch (error) {
          console.log(error);
          await new Promise<void>((resolve) => setTimeout(resolve, 10));
        }
      }
    }
  }

  const { url, close, fetch } = await listen((event) =>
    toResponse(<App request={event.request} />)
  );

  const random = Math.random();
  const {
    echo: [echo],
  } = descendants(
    <Fetch
      fetch={fetch}
      url={url}
      method="POST"
      body={JSON.stringify({
        random,
      })}
    />
  ).group(name);
  const body = properties(await echo);
  console.log(body);
  if (body.random !== random)
    throw new Error("Expected body to contain random");

  await close();
}
