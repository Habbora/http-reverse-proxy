import { ENV } from "./core/config/env";
import { startApiServer } from "./core/server/server";
import { runMigrations } from "./core/database/migrate";
import { workerRegistry } from "./core/worker/registry";

// Imports to register workers
import { startProxyServer } from "./modules/proxy/proxy.server";
import { ProxyService } from "./modules/proxy/proxy.service";

await runMigrations();

const { API_PORT, PROXY_DOMAIN, PROXY_PORT } = ENV;

startApiServer(API_PORT);


// Start the proxy server
await startProxyServer(PROXY_PORT, PROXY_DOMAIN);
