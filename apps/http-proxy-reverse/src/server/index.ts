import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { routeRoute } from "../route/route";

const app = new Elysia()
    .use(cors())
    .use(routeRoute)

export const startApiServer = (port: number) => {
    app.listen(port);

    console.log(`Elysia API server started on port ${port}`);
}
