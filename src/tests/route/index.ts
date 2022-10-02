import { route, listen } from "../../routes";
import { ok } from "../../is";

{
  {
    route(({ request }) => console.log(request.method, request.url));

    route("/", ({ request }) => {
      return new Response("Hello!");
    });

    route("/test", ({ request }) => {
      return new Response("Test!");
    });

    route("/json", async ({ request }) => {
      const { method } = request;
      if (method !== "POST") {
        return new Response("", { status: 500 });
      }
      const body = await request.json();
      return new Response(JSON.stringify(body), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  }

  {
    const { fetch, close } = await listen();

    {
      const response = await fetch("/");
      const text = await response.text();
      ok(text === "Hello!");
    }

    {
      const response = await fetch("/test");
      const text = await response.text();
      ok(text === "Test!");
    }

    {
      const response = await fetch("/json");
      ok(!response.ok);
    }

    {
      const random = Math.random();
      const value = `${Math.random()}`;
      const response = await fetch("/json", {
        method: "POST",
        body: JSON.stringify({
          random,
          value,
        }),
      });
      ok(response.ok);
      const body = await response.json();
      ok(body.random === random);
      ok(body.value === value);
    }

    await close();
  }
}
