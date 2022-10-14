import { listen, respondWith } from "../../listen";
import { h } from "@virtualstate/focus";

async function App({ request }: { request: Request }) {
  await new Promise(resolve => setTimeout(resolve, 50));
  const { pathname } = new URL(request.url);
  const urlKey = pathname
      .split("/")
      .filter(Boolean)
      .join("-") || "home";
  return (
      <html>
      <head>
        <title>Website</title>
      </head>
      <body class={`page-${urlKey}`}>
        <h1>Hello</h1>
        <main>
          <p>This is an example</p>
        </main>
        <footer>
          <a href="/page">Another page</a>
        </footer>
      </body>
      </html>
  )
}

void listen(event => {
  const { request } = event;
  return respondWith(event, <App request={request} />);
});
