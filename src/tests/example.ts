import {listen} from "../listen";


{

    const { url, close } = await listen(
        event => event.respondWith(new Response("Hello!"))
    );

    console.log(`Listening on ${url}`);

    const response = await fetch(url);
    const text = await response.text();
    console.log(text);

    if (text !== "Hello!") throw new Error("Expected Hello!");

    await close();

}