const BACKEND_SERVERS = [
    "http://172.16.1.105:3000"
];

let currentServer = 0;

/**
 * Round-robin load balancing,
 * Returns the next backend server URL to use for load balancing.
 * @return {string} The next backend server URL
 */
function getNextServer() {
  const server = BACKEND_SERVERS[currentServer];
  currentServer = (currentServer + 1) % BACKEND_SERVERS.length;
  return server;
}

/**
 * Handles incoming requests and forwards them to the backend servers.
 * @param {Request} req - The incoming request object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const targetServer = getNextServer();
    const targetUrl = targetServer + url.pathname + url.search;
    
    const controller = new AbortController();
    // 30s timeout, if the backend server doesn't respond in time, the request is aborted.
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
  
  // Remove headers que o Bun vai gerenciar
  cleaned.delete("content-length"); // Bun recalcula
  cleaned.delete("transfer-encoding"); // Bun decide
  
  return cleaned;
}

console.log("HTTP Reverse Proxy is running on port 3000");