import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { routeRoute } from "../../modules/proxy/proxy.routes";

const app = new Elysia()
    .use(cors())
    .use(routeRoute)

export const startApiServer = (port: number) => {
    app.listen(port);

    console.log(`Elysia API server started on port ${port}`);
}
