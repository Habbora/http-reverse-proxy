import { ENV } from "./env";
import { startApiServer } from "./server";
import { startProxyServer } from "./route";
import { runMigrations } from "./db/migrate";

await runMigrations();

const { API_PORT, PROXY_PORT, PROXY_DOMAIN } = ENV;

startApiServer(API_PORT);
startProxyServer(PROXY_PORT, PROXY_DOMAIN);