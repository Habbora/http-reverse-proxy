import { eq } from "drizzle-orm";
import { db } from "../db";
import { proxyRoutesTable } from "../db/schema";
import type { CreateRoute, UpdateRoute } from "./schema";

export const proxyDomainRoutes = new Map<string, URL>();

export const ProxyService = {
    loadProxyRoutes: async () => {
        proxyDomainRoutes.clear();
        const dbRoutes = await db.select().from(proxyRoutesTable);
        dbRoutes.forEach((route) => {
            proxyDomainRoutes.set(route.id, new URL(route.url || ""));
        })
    },
    listRoutes: async () => {
        return await db.select().from(proxyRoutesTable);
    },
    createRoute: async (createRoute: CreateRoute) => {
        try {
            new URL(createRoute.url || "");
        } catch (error) {
            throw new Error("Invalid URL");
        }

        const dbRoute = await db.insert(proxyRoutesTable)
            .values({ name: createRoute.name, url: createRoute.url })
            .returning();

        await ProxyService.loadProxyRoutes();

        return dbRoute[0];
    },
    updateRoute: async (id: string, updateRoute: UpdateRoute) => {
        const existingRoute = proxyDomainRoutes.get(id);
        if (!existingRoute) throw new Error("Route does not exist");

        try {
            const checkUrl = new URL(updateRoute.url || "");
        } catch (error) {
            throw new Error("Invalid URL");
        }
        
        const dbRoute = await db.update(proxyRoutesTable)
            .set({ name: updateRoute.name, url: updateRoute.url })
            .where(eq(proxyRoutesTable.id, id))
            .returning();

        await ProxyService.loadProxyRoutes();

        return dbRoute[0];
    },
    deleteRoute: async (id: string) => {
        const dbRoute = await db.delete(proxyRoutesTable)
            .where(eq(proxyRoutesTable.id, id))
            .returning();

        await ProxyService.loadProxyRoutes();

        return dbRoute[0];
    },
}