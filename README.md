# `@virtualstate/listen`

Fetch listener

[//]: # (badges)

### Support

 ![Node.js supported](https://img.shields.io/badge/node-%3E%3D16.0.0-blue) ![Deno supported](https://img.shields.io/badge/deno-%3E%3D1.17.0-blue) ![Bun supported](https://img.shields.io/badge/bun-%3E%3D0.1.11-blue) 

### Test Coverage

 ![89.2%25 lines covered](https://img.shields.io/badge/lines-89.2%25-brightgreen) ![89.2%25 statements covered](https://img.shields.io/badge/statements-89.2%25-brightgreen) ![90.62%25 functions covered](https://img.shields.io/badge/functions-90.62%25-brightgreen) ![77.65%25 branches covered](https://img.shields.io/badge/branches-77.65%25-yellow)

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