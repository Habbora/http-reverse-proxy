import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { proxyRoutesTable } from "../db/schema";

export const RouteSchema = createSelectSchema(proxyRoutesTable);
export type Route = z.infer<typeof RouteSchema>

export const CreateRouteSchema = RouteSchema.omit({ id: true })
export type CreateRoute = z.infer<typeof CreateRouteSchema>

export const UpdateRouteSchema = CreateRouteSchema.partial()
export type UpdateRoute = z.infer<typeof UpdateRouteSchema>
