import { ENV } from "./core/config/env";
import { startApiServer } from "./core/server/server";
import { runMigrations } from "./core/database/migrate";
import { workerRegistry } from "./core/worker/registry";

// Imports to register workers
import "./modules/proxy/workers/proxy.manager";
import { ProxyService } from "./modules/proxy/proxy.service";

await runMigrations();

const { API_PORT } = ENV;

startApiServer(API_PORT);

// Start all registered workers
await workerRegistry.startAll();

await ProxyService.loadProxyRoutes();
