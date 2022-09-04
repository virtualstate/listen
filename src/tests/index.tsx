try {
    await import("./server");
    await import("./example");
    await import("./example-jsx");
} catch (error) {
    console.error(error);
    if (typeof process !== "undefined") {
        process.exit(1);
    }
    throw error;
}

export default 1;
