import { toJSONReadableStream, toHTMLReadableStream } from "./stream";
import { FetchEventCore} from "./fetch-listener";

export function toJSONResponse(node: unknown) {
  return new Response(toJSONReadableStream(node), {
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function toHTMLResponse(node: unknown) {
  return new Response(toHTMLReadableStream(node), {
    headers: {
      "Content-Type": "text/html",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function toResponse(node: unknown, request?: Request) {
  const accept = request?.headers.get("accept");
  if (accept?.includes("text/html")) {
    return toHTMLResponse(node);
  }
  return toJSONResponse(node);
}

export function respondWith(event: FetchEventCore, node: unknown) {
  return event.respondWith(
      toResponse(
          node,
          event.request
      )
  );
}