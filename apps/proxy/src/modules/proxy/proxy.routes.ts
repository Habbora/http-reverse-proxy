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

/**
 * Aqui não tem codigo complicado, apenas fazer a chamada ao service
 * e retornar o resultado.
 * 
 * Não precisa saber sobre db, apenas chamar o service.
 * 
 * Então é isso, não precisa saber como o service funciona, apenas chamar.
 * 
 * Por isso, o service é a camada de negócio, e o route é a camada de apresentação.
 * 
 * Mas ainda é bom ter uma camada de apresentação, para separar a lógica de negócio
 * da lógica de apresentação.
 * 
 * Logo, o route é a camada de apresentação, e o service é a camada de negócio.
 * 
 * Afinal, o route é a camada de apresentação, e o service é a camada de negócio.
 * 
 * Então, o route é a camada de apresentação, e o service é a camada de negócio.
 */