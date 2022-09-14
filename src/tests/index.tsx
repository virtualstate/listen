/* c8 ignore start */
try {
    await import("./server");
    await import("./example");
    await import("./example-jsx");
    await import("./paired");
} catch (error) {
    console.error(error);
    if (typeof process !== "undefined") {
        process.exit(1);
    }
    throw error;
}

export default 1;
