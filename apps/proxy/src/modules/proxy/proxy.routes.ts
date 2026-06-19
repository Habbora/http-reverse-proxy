import Elysia from "elysia";
import { CreateRouteSchema, UpdateRouteSchema } from "./proxy.schema";
import { ProxyService } from "./proxy.service";

export const routeRoute = new Elysia
    ({
        prefix: "/proxy",
    })
    .get("/", async () => {
        return await ProxyService.getRoutes();
    })
    .post("/", async ({ body }) => {
        const data = await ProxyService.createRoute(body);
        console.log(data);
        return data;
    }, {
        body: CreateRouteSchema,
    })
    .put("/:id", async ({ params: { id }, body }) => {
        console.log(body);
        return await ProxyService.updateRoute(id, body);
    }, {
        body: UpdateRouteSchema,
    })  
    .delete("/:id", async ({ params: { id } }) => {
        return await ProxyService.deleteRoute(id);
    })
