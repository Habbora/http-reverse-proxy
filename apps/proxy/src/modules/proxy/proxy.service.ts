import { eq } from "drizzle-orm";
import { db } from "../../core/database/client";
import { proxyRoutesTable } from "../../core/database/schema";
import { UpdateRouteSchema, type CreateRoute, type ProxyRoute, type RouteResponse, type UpdateRoute } from "./proxy.schema";
import { notifyWorkerRoutesUpdated } from "./workers/proxy.manager";
import { toDomainUrl } from "../../shared/utils/toDomainUrl";

export const proxyRoutesCache = new Map<string, ProxyRoute>();

export const ProxyService = {
    loadProxyRoutes: async () => {
        proxyRoutesCache.clear();
        const routesDb = await db.select().from(proxyRoutesTable);
        routesDb.forEach((route) => proxyRoutesCache.set(route.id, route));
        notifyWorkerRoutesUpdated(Array.from(proxyRoutesCache.values()));
    },
    toRouteResponse: (route: ProxyRoute): RouteResponse => {
        const url = toDomainUrl(route.id, "http");
        return {
            id: route.id,
            isActive: route.isActive,
            proxyName: route.proxyName,
            targetUrl: route.targetUrl,
            proxyUrl: url,
        }
    },
    getRoutes: async (): Promise<RouteResponse[]> => {
        const routes = await db.select().from(proxyRoutesTable);
        return routes.map(ProxyService.toRouteResponse);
    },
    createRoute: async (createRoute: CreateRoute): Promise<RouteResponse> => {
        try {
            new URL(createRoute.targetUrl || "");
        } catch (error) {
            throw new Error("Invalid target URL");
        }

        const [dbRoute] = await db.insert(proxyRoutesTable)
            .values({ proxyName: createRoute.proxyName, targetUrl: createRoute.targetUrl })
            .returning();

        await ProxyService.loadProxyRoutes();

        return ProxyService.toRouteResponse(dbRoute!);
    },
    updateRoute: async (id: string, updateRoute: UpdateRoute): Promise<RouteResponse> => {
        const parsed = UpdateRouteSchema.safeParse(updateRoute);

        try {
            if (parsed.success && parsed.data.targetUrl) {
                new URL(parsed.data.targetUrl || "");
            }
        } catch (error) {
            throw new Error("Invalid target URL");
        }
        
        if (!parsed.success) throw new Error("Invalid update route");

        const [dbRoute] = await db.update(proxyRoutesTable)
            .set(parsed.data)
            .where(eq(proxyRoutesTable.id, id))
            .returning();

        await ProxyService.loadProxyRoutes();

        return ProxyService.toRouteResponse(dbRoute!);
    },
    deleteRoute: async (id: string) => {
        const [dbRoute] = await db.delete(proxyRoutesTable)
            .where(eq(proxyRoutesTable.id, id))
            .returning();

        await ProxyService.loadProxyRoutes();

        return ProxyService.toRouteResponse(dbRoute!);
    },
}
