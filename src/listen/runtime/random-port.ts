export function randomPort() {
    // Example 60019 or 65535
    const max = 65535;
    const half = max / 2
    return Math.min(
        Math.round(half + (half * Math.random())),
        max
    );
}