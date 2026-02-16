import { proxyDomainRoutes, ProxyService } from "./service";

const matchProxySubDomain = (domain: string, proxyDomain?: string) => {
    for (const [key, value] of proxyDomainRoutes) {
        if (domain.includes(key)) return value;
    }
    return null;
}

export const startProxyServer = (port: number, proxyDomain?: string) => {
    const server = Bun.serve({
        port: port,
        async fetch(req) {
            const url = new URL(req.url);
            const controller = new AbortController();

            const targetServer = matchProxySubDomain(url.hostname, proxyDomain);
            if (!targetServer) controller.abort();

            const targetUrl = targetServer + url.pathname + url.search;

            const timeoutId = setTimeout(() => controller.abort(), 30000);

            try {
                const response = await fetch(targetUrl, {
                    method: req.method,
                    headers: sanitizeRequestHeaders(req.headers),
                    body: req.body,
                    signal: controller.signal,
                    redirect: "manual",
                });

                clearTimeout(timeoutId);

                return new Response(response.body, {
                    status: response.status,
                    headers: sanitizeResponseHeaders(response.headers),
                });

            } catch (error: any) {
                clearTimeout(timeoutId);

                if (error.name === "AbortError") {
                    return new Response("Gateway Timeout", { status: 504 });
                }

                console.error("Proxy error:", error);
                return new Response("Bad Gateway", { status: 502 });
            }
        }
    });

    ProxyService.loadProxyRoutes();

    console.log(`Proxy server started on port ${port}`);

    return server;
};

/**
 * Sanitizes request headers by removing hop-by-hop headers and adding X-Forwarded-* headers.
 * @param {Headers} headers - The request headers to sanitize.
 * @return {Headers} The sanitized request headers.
 */
function sanitizeRequestHeaders(headers: Headers) {
    const cleaned = new Headers(headers);

    // Remove hop-by-hop headers (RFC 7230)
    const hopByHop = [
        "connection", "keep-alive", "proxy-authenticate",
        "proxy-authorization", "te", "trailers", "transfer-encoding", "upgrade"
    ];

    hopByHop.forEach(h => cleaned.delete(h));

    // Adiciona X-Forwarded-* headers
    cleaned.set("x-forwarded-proto", "http");
    cleaned.set("x-forwarded-host", headers.get("host") || "");

    return cleaned;
}

/**
 * Sanitizes the response headers by removing hop-by-hop headers and specific headers.
 * @param {Headers} headers - The response headers to sanitize.
 * @return {Headers} The sanitized response headers.
 */
function sanitizeResponseHeaders(headers: Headers) {
    const cleaned = new Headers(headers);

    cleaned.delete("content-length"); // Bun recalcula
    cleaned.delete("transfer-encoding"); // Bun decide

    return cleaned;
}

export { ProxyService } from "./service";