import { type ProxyRoute } from "../proxy.schema";

declare var self: Worker;

const proxyRoutesCache = new Map<string, ProxyRoute>();
let server: any;

type InitPayload = {
    port: number;
    proxyDomain?: string;
};

const matchProxySubDomain = (domain: string, proxyDomain?: string) => {
    // Current logic: check if domain includes the route key (id)
    // Example: if route.id is "app", and domain is "app.localhost", it matches.
    for (const [key, value] of proxyRoutesCache) {
        if (domain.includes(key)) return value.targetUrl;
    }
    return null;
}

/**
 * Sanitizes request headers by removing hop-by-hop headers and adding X-Forwarded-* headers.
 */
function sanitizeRequestHeaders(headers: Headers) {
    const cleaned = new Headers(headers);

    // Remove hop-by-hop headers (RFC 7230)
    const hopByHop = [
        "connection", "keep-alive", "proxy-authenticate",
        "proxy-authorization", "te", "trailers", "transfer-encoding", "upgrade"
    ];

    hopByHop.forEach(h => cleaned.delete(h));

    // Add X-Forwarded-* headers
    cleaned.set("x-forwarded-proto", "http");
    cleaned.set("x-forwarded-host", headers.get("host") || "");

    return cleaned;
}

/**
 * Sanitizes the response headers by removing hop-by-hop headers and specific headers.
 */
function sanitizeResponseHeaders(headers: Headers) {
    const cleaned = new Headers(headers);

    cleaned.delete("content-length"); // Bun recalculates
    cleaned.delete("transfer-encoding"); // Bun decides

    return cleaned;
}

const startProxyServer = (port: number, proxyDomain?: string) => {
    if (server) {
        postMessage({ type: 'LOG', message: "Proxy server already running" });
        return;
    }

    server = Bun.serve({
        port: port,
        async fetch(req) {
            const url = new URL(req.url);
            // Use AbortController for timeout management
            const controller = new AbortController();

            const targetServer = matchProxySubDomain(url.hostname, proxyDomain);
            if (!targetServer) {
                // No route found
                return new Response("Not Found", { status: 404 });
            }

            const targetUrl = targetServer + url.pathname + url.search;
            
            // 30s timeout
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

                // console.error is not always visible from workers depending on env, 
                // but Bun usually pipes it. sending explicit error msg too.
                postMessage({ type: 'ERROR', message: `Proxy error: ${error.message}` });
                return new Response("Bad Gateway", { status: 502 });
            }
        }
    });

    postMessage({ type: 'LOG', message: `Proxy server started on port ${port}` });
};

self.onmessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
        case "INIT":
            const { port, proxyDomain } = payload as InitPayload;
            startProxyServer(port, proxyDomain);
            break;
        
        case "UPDATE_ROUTES":
            const routes = payload as ProxyRoute[];
            proxyRoutesCache.clear();
            routes.forEach(route => {
                proxyRoutesCache.set(route.id, route);
            });
            postMessage({ type: 'LOG', message: `Routes updated: ${routes.length} routes loaded` });
            break;
            
        default:
            postMessage({ type: 'LOG', message: `Unknown message type: ${type}` });
    }
};
