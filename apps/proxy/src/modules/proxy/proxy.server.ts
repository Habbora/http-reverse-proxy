import type { ProxyRoute, RouteResponse } from "./proxy.schema";
import { ProxyService } from "./proxy.service";

function sanitizeResponseHeaders(headers: Headers) {
    const cleaned = new Headers(headers);

    cleaned.delete("content-length");
    cleaned.delete("transfer-encoding");
    cleaned.delete("content-encoding");

    return cleaned;
}

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

    cleaned.set("accept-encoding", "identity");

    return cleaned;
}

const TIMEOUT = 30_000;

export class ProxyServer {
    private server: Bun.Server<undefined>;

    constructor(private port: number, private proxyDomain?: string) {
        this.server = Bun.serve({
            port: this.port,
            fetch: async (req: Request) => {
                // Get the URL
                const url = new URL(req.url);

                // Match the proxy subdomain to the target server
                const targetServer = this.matchProxySubDomain(url.hostname);
                if (!targetServer) return new Response("Not Found", { status: 404 });

                // Build the target URL
                const targetUrl = targetServer + url.pathname + url.search;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

                try {
                    const response = await fetch(targetUrl, {
                        method: req.method,
                        headers: sanitizeRequestHeaders(req.headers),
                        body: req.body,
                        signal: controller.signal,
                        redirect: "manual",
                        decompress: true,
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
                    
                    return new Response("Internal Server Error", { status: 500 });
                }
            }
        });
    }

    private matchProxySubDomain = (domain: string) => {
        return ProxyService.resolveTargetProxy(domain)?.targetUrl;
    }
}

export const startProxyServer = async (port: number, proxyDomain?: string) => {
    const proxyServer = new ProxyServer(port, proxyDomain);
    return proxyServer;
}