import { toReadableStream } from "./stream";

export function toResponse(node: unknown) {
  return new Response(toReadableStream(node), {
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
