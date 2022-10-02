import type { IncomingMessage } from "node:http";
import { createReadableStreamFromIterable } from "../stream";
import { isArray, ok } from "../../is";
import {
  createFetch,
  dispatchEvent,
  FetchListener,
  FetchListenerFn,
} from "../fetch-listener";
import type { Server, ServerResponse } from "node:http";

function fromIncomingMessage(message: IncomingMessage, baseUrl?: string) {
  const url = new URL(message.url, baseUrl);
  let body;
  if (message.method !== "GET" && message.method !== "HEAD") {
    body = createReadableStreamFromIterable(message);
  }
  const headers = new Headers();
  for (const [key, value] of Object.entries(message.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    }
  }
  return new Request(url, {
    method: message.method,
    headers,
    body,
  });
}

function getPort() {
  const env = process.env.PORT;
  if (env && /^\d+$/.test(env)) {
    return +env;
  }
  return 0; // random;
}

function getHostname(server: Server) {
  const addressInfo = server.address();

  ok(typeof addressInfo !== "string");
  ok(addressInfo);

  const { port } = addressInfo;

  ok(port);

  return `http://0.0.0.0:${port}`;
}

export async function listen(fn: FetchListenerFn): Promise<FetchListener> {
  const { createServer } = await import("node:http");

  const server = createServer((message, response) => {
    void onMessage(message, response); // Allow throwing unhandled rejection
  });

  await new Promise<void>((resolve) => server.listen(getPort(), resolve));

  const url = getHostname(server);

  return {
    url,
    close,
    fetch: createFetch(url, fn),
  } as const;

  function close() {
    return new Promise<void>((resolve, reject) =>
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      })
    );
  }

  async function onMessage(
    message: IncomingMessage,
    serverResponse: ServerResponse
  ) {
    let sentResponse = false;
    try {
      const response = await dispatchEvent(
        fromIncomingMessage(message, getHostname(server)),
        fn
      );
      await sendResponse(response);
    } catch (error) {
      console.error(error);
      await sendResponse(
        new Response(undefined, {
          status: 500,
        })
      );
    } finally {
      try {
        serverResponse.end();
      } catch {}
    }

    async function sendResponse(response: Response) {
      if (sentResponse) return;
      sentResponse = true;
      const { body, headers } = response;
      headers.forEach((value, key) => {
        serverResponse.setHeader(key, value);
      });
      serverResponse.writeHead(response.status, response.statusText);
      if (body) {
        return await body.pipeTo(
          new WritableStream({
            write(chunk) {
              serverResponse.write(chunk);
            },
          })
        );
      }
    }
  }
}
