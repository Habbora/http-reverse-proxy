import Elysia from "elysia";
import { db } from "../db";
import { proxyRoutesTable } from "../db/schema";
import { CreateRouteSchema, UpdateRouteSchema } from "./schema";
import { ProxyService } from "./service";

export const routeRoute = new Elysia
    ({
        prefix: "/route",
    })
    .get("/", async () => {
        return await db.select().from(proxyRoutesTable);
    })
    .post("/", async ({ body }) => {
        return await ProxyService.createRoute(body);
    }, {
        body: CreateRouteSchema,
    })
    .put("/:id", async ({ params: { id }, body }) => {
        return await ProxyService.updateRoute(id, body);
    }, {
        body: UpdateRouteSchema,
    })  
    .delete("/:id", async ({ params: { id } }) => {
        return await ProxyService.deleteRoute(id);
    })
