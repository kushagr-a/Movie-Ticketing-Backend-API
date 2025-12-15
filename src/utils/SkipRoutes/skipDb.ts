export const skipDb = (path: string) => {
    const exactSkip = ["/"]; // sirf exact `/` path ko skip karna hai
    const prefixSkip = ["/health", "/api/v1/healthCheck", "/dbString"]; // prefix based skip

    // exact match routes
    if (exactSkip.includes(path)) return true;

    // prefix match routes
    return prefixSkip.some((route) => path.startsWith(route));
}