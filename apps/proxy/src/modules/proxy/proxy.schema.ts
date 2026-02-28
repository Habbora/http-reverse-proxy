import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { proxyRoutesTable } from "../../core/database/schema";

export const RouteSchema = createSelectSchema(proxyRoutesTable);
export type ProxyRoute = z.infer<typeof RouteSchema>

export const CreateRouteSchema = RouteSchema.omit({ id: true, isActive: true })
export type CreateRoute = z.infer<typeof CreateRouteSchema>

export const UpdateRouteSchema = RouteSchema.omit({ id: true }).partial()
export type UpdateRoute = z.infer<typeof UpdateRouteSchema>

export const RouteResponseSchema = RouteSchema.extend({ proxyUrl: z.string() })
export type RouteResponse = z.infer<typeof RouteResponseSchema>