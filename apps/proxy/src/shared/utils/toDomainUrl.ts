import { ENV } from "../../core/config/env";

const proxyDomain = ENV.PROXY_DOMAIN ? `.${ENV.PROXY_DOMAIN}` : ".localhost";

export const toDomainUrl = (id: string, protocol: string = "http") => `${protocol}://${id}${proxyDomain}`;
