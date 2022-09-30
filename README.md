# `@virtualstate/listen`

Fetch listener

[//]: # (badges)

### Support

 ![Node.js supported](https://img.shields.io/badge/node-%3E%3D18.7.0-blue) ![Deno supported](https://img.shields.io/badge/deno-%3E%3D1.17.0-blue) ![Bun supported](https://img.shields.io/badge/bun-%3E%3D0.1.11-blue) 

### Test Coverage

 ![96.8%25 lines covered](https://img.shields.io/badge/lines-96.8%25-brightgreen) ![96.8%25 statements covered](https://img.shields.io/badge/statements-96.8%25-brightgreen) ![96.55%25 functions covered](https://img.shields.io/badge/functions-96.55%25-brightgreen) ![90.34%25 branches covered](https://img.shields.io/badge/branches-90.34%25-brightgreen)

[//]: # (badges)

# Usage

```typescript
import { listen } from "@virtualstate/listen";

const { url, close } = await listen(
    event => event.respondWith(new Response("Hello!"))
);

console.log(`Listening on ${url}`);

const response = await fetch(url);
const text = await response.text();
console.log(text);

if (text !== "Hello!") throw new Error("Expected Hello!");

await close();
```

## JSX

```jsx
import { listen, toResponse, toAsyncString, Fetch } from "@virtualstate/listen";
import { h, descendants, name, properties } from "@virtualstate/focus";

async function *App({ request }) {
    if (request.method === "POST") {
        const body = JSON.parse(
            await toAsyncString(request)
        );
        yield <echo {...body} />
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

if (body.random !== random) throw new Error("Expected body to contain random")
```