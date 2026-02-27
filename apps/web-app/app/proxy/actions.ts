"use server";

import { refresh, revalidatePath } from "next/cache";
import {
  createProxyRoute,
  deleteProxyRoute,
  listProxyRoutes,
  updateProxyRoute,
} from "@/lib/proxy/service";
import { CreateProxyRouteInput, UpdateProxyRouteInput } from "@/lib/proxy/types";

export async function listRoutesAction() {
  return listProxyRoutes();
}

export async function createRouteAction(
  formData: FormData,
) {
  const raw = {
    proxyName: String(formData.get("proxyName") ?? "").trim(),
    targetUrl: String(formData.get("targetUrl") ?? "").trim(),
  }

  const parsed = CreateProxyRouteInput.parse(raw);

  const created = await createProxyRoute(parsed)
  revalidatePath("/proxy")

  return created;
}

export async function updateRouteAction(
  id: string,
  formData: FormData,
) {
  const raw = {
    isActive: formData.get("isActive") ? Boolean(formData.get("isActive")) : undefined,
    proxyName: formData.get("proxyName") ? String(formData.get("proxyName") ?? "").trim() : undefined,
    targetUrl: formData.get("targetUrl") ? String(formData.get("targetUrl") ?? "").trim() : undefined,
  }

  const parsed = UpdateProxyRouteInput.parse(raw);

  const updated = await updateProxyRoute(id, parsed)
  revalidatePath("/proxy")

  return updated;
}

export async function deleteRouteAction(id: string) {
  const deleted = await deleteProxyRoute(id)
  revalidatePath("/proxy")
  return deleted
}

export async function updateActiveAction(id: string, isActive: boolean) {
  const raw = { isActive }
  const parsed = UpdateProxyRouteInput.parse(raw)
  console.log(parsed);
  const updated = await updateProxyRoute(id, parsed)
  revalidatePath("/proxy")
  return updated;
}
