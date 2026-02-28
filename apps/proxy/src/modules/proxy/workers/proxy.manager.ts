import { ENV } from "../../../core/config/env";
import { workerRegistry } from "../../../core/worker/registry";
import { type ProxyRoute } from "../proxy.schema";

let proxyWorker: Worker | null = null;

const startProxyWorker = () => {
    if (proxyWorker) return;

    const port = ENV.PROXY_PORT;
    const proxyDomain = ENV.PROXY_DOMAIN;

    // Creates the worker pointing to the proxy-worker.ts file
    // Using import.meta.url ensures relative path resolution works correctly in Bun
    proxyWorker = new Worker(new URL("./proxy.worker.ts", import.meta.url));
    
    // Send initialization configuration
    proxyWorker.postMessage({
        type: "INIT",
        payload: {
            port,
            proxyDomain
        }
    });

    // Listen for messages from the worker (logs, status, etc)
    proxyWorker.onmessage = (event) => {
        // We can handle specific worker events here if needed
        // For now just logging what comes back
        if (event.data?.type === 'LOG') {
             console.log(`[ProxyWorker] ${event.data.message}`);
        } else if (event.data?.type === 'ERROR') {
             console.error(`[ProxyWorker Error] ${event.data.message}`);
        }
    };

    console.log("Proxy worker initialized");
};

export const getWorker = () => proxyWorker;

export const notifyWorkerRoutesUpdated = (routes: ProxyRoute[]) => {
    if (!proxyWorker) {
        console.warn("Proxy worker not initialized, cannot update routes");
        return;
    }

    proxyWorker.postMessage({
        type: "UPDATE_ROUTES",
        payload: routes
    });
};

// Register the worker
workerRegistry.register("ProxyWorker", startProxyWorker);
