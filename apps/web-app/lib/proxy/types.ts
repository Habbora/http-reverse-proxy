import z from "zod"

export const ProxyRoute = z.object({
    id: z.string(),
    isActive: z.boolean(),
    proxyName: z.string(),
    proxyUrl: z.url(),
    targetUrl: z.url(),
})
export type ProxyRoute = z.infer<typeof ProxyRoute>

export const CreateProxyRouteInput = ProxyRoute.omit({ id: true, isActive: true, proxyUrl: true })
export type CreateProxyRouteInput = z.infer<typeof CreateProxyRouteInput>

export const UpdateProxyRouteInput = ProxyRoute.omit({ id: true, proxyUrl: true }).partial()
export type UpdateProxyRouteInput = z.infer<typeof UpdateProxyRouteInput>

export interface ProxyApiError extends Error {
  status?: number;
  details?: string;
}

export type ProxyErrorLike = {
  status?: number;
  details?: unknown;
  message?: string;
};