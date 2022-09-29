// const test :Workerd.Worker = (
//     modules = [
//         (name = "esnext-workerd/tests/workerd/test.js", esModule = embed "esnext-workerd/tests/workerd/test.js")
// ],
// compatibilityDate = "2022-09-16",
// );

export const test = {
    modules: [
        {
            name: "esnext-workerd/tests/workerd/server.js",
            esModule: {
                embed: "esnext-workerd/tests/workerd/server.js"
            }
        }
    ],
    compatibilityDate: "2022-09-16",
};