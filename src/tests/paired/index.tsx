import {
  children,
  descendants,
  h,
  isNumber,
  name,
  properties,
  createFragment,
  design,
  toJSON,
} from "@virtualstate/focus";
import { Fetch, listen, toAsyncString, toResponse } from "../../listen";
import { ok } from "../../is";
import { fromBody } from "../../listen";

{
  const { url, close, fetch } = await listen((event) => {
    const { request } = event;
    const { method } = request;
    const {
      body: [body],
    } = fromBody(request).group(name);

    return toResponse(<Body />);

    async function* Body() {
      if (method === "POST") {
        const { value = 0 } = properties(await body);
        ok(isNumber(value));
        yield <body value={value + 10} />;
      } else if (method === "PUT") {
        const { value = 0 } = properties(await body);
        ok(isNumber(value));
        yield <body value={value + 5} />;
        yield (
          <>
            <body value={value + 9} />
            <body value={2} />
          </>
        );
        yield <body value={value + 6} />;
      } else if (method === "GET") {
        yield <body value={1} />;
      } else {
        yield <body value={0} />;
      }
    }
  });

  async function logProperties(node: unknown) {
    for await (const snapshot of children(node).map(properties)) {
      console.log(...snapshot);
    }
  }

  await logProperties(<Fetch url={url} fetch={fetch} />);
  await logProperties(
    <Fetch url={url} method="POST" fetch={fetch}>
      <Fetch url={url} fetch={fetch} />
    </Fetch>
  );
  await logProperties(
    <Fetch url={url} method="PUT" credentials="omit" fetch={fetch}>
      <Fetch url={url} method="POST" credentials="omit" fetch={fetch}>
        <Fetch url={url} credentials="omit" fetch={fetch} />
      </Fetch>
    </Fetch>
  );

  await close();
}

{
  console.log("Starting paired server");

  const f = h;

  const { url, close, fetch } = await listen(async (event) => {
    const { request } = event;

    async function* App() {
      const h = f; // We are ensuring we are using a generic h

      yield <p>Hello from in the app!</p>;

      // We can use async
      await new Promise((resolve) => setTimeout(resolve, 100));

      yield <p>This is an update from the server</p>;
    }

    async function run() {
      const root = design({
        async: true, // If we want the design to be observable
      });
      let { h } = root;

      // This defines a top level node and replaces the JSX root context
      ({ h } = <html />);

      event.respondWith(toResponse(root));

      const head = (
        <head>
          <title>{request.url}</title>
        </head>
      );

      const body = <body></body>;

      // By this point both body and head are available to the response.
      //
      // Updates to them through reference will reflect in the response

      {
        // In this scope we are adding elements inside the body
        const { h } = body;

        <h1>Hello!</h1>;

        <main>
          <article>This is defined within JSX</article>
          <article>This is another article</article>
          <App /> {/* We can define a component! */}
        </main>;

        <footer>This is a footer</footer>;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      {
        const { h } = head;

        <link href={new URL("update", url)} name="update" />;

        await new Promise((resolve) => setTimeout(resolve, 100));

        <link href={new URL("update/2", url)} name="update/2" />;
      }

      // await new Promise(resolve => setTimeout(resolve, 300));

      // Close must be called to finish the response
      root.close();

      console.log("Closing designer");
    }

    return run()
      .catch(console.error)
      .then(() => console.log("done"));
  });
  console.log("Have paired server", { url });

  // for await (const snapshot of toAsyncString(await fetch(url))) {
  //     console.log(snapshot);
  // }
  //
  for await (const snapshot of toJSON(<Fetch url={url} fetch={fetch} />)) {
    console.log(snapshot);
  }

  await close();
}
