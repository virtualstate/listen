import { listen } from "../../listen/runtime/workerd";
import { toResponse } from "../../listen";
import { h } from "@virtualstate/focus";
import { createFetch, route } from "../../routes";

async function* App() {
  const startedAt = new Date().toISOString();

  yield <hello>Hello workerd! Started at {startedAt}</hello>;

  for (let i = 1; i <= 3; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield (
      <hello>
        Started at {startedAt}
        workerd updated server side! Updated {i} times Last updated at{" "}
        {new Date().toISOString()}
      </hello>
    );
  }
}

route("/", ({ request }) => toResponse(<App request={request} />));

function Path({ id }: { id: string }) {
    return <p>Hi! This is from a specific path with the id: {id}</p>;
}

route(
    "/path/:id",
    (
        event,
        {
            pathname: {
                groups: { id },
            },
        }
    ) => toResponse(<Path id={id} />)
);

async function Posts() {
    return (
        <ul>
            <a href="/post/1">Post 1</a>
            <a href="/post/2">Post 2</a>
            <a href="/post/3">Post 3</a>
        </ul>
    );
}

route(
    "/posts",
    () => toResponse(<Posts />)
);


function Post({ id }: { id: string }) {
    return (
        <article>
            <h1>Post {id}</h1>
            <section>
                <p>This is an article!</p>
            </section>
            <footer>
                Generated at {new Date().toISOString()}
            </footer>
        </article>
    )
}

route(
    "/post/:id",
    (
        event,
        {
            pathname: {
                groups: { id },
            },
        }
    ) => toResponse(<Post id={id} />)
);

export default {
  fetch: createFetch(),
};
