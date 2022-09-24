/* c8 ignore start */
try {
    await import("./server");
    await import("./example");
    await import("./example-jsx");
    await import("./paired");
    await import("./route");
} catch (error) {
    console.error(error);
    if (typeof process !== "undefined") {
        process.exit(1);
    }
    throw error;
}

export default 1;
