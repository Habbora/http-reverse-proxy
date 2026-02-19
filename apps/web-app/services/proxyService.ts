const PROXY_API_URL =
  process.env.PROXY_API_URL || "http://localhost:4001";

export type ProxyRoute = {
  id: string;
  name: string;
  url: string;
};

type CreateProxyRouteInput = {
  name: string;
  url: string;
};

type UpdateProxyRouteInput = {
  isActive?: 0 | 1;
  name?: string;
  url?: string;
};

interface ProxyApiError extends Error {
  status?: number;
  details?: string;
}

export type ProxyErrorLike = {
  status?: number;
  details?: unknown;
  message?: string;
};

async function callProxyApi(path: string, init?: RequestInit) {
  const response = await fetch(`${PROXY_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const error: ProxyApiError = new Error(
      `Proxy API error ${response.status} ${response.statusText}`,
    ) as ProxyApiError;
    error.status = response.status;
    error.details = errorText;
    throw error;
  }

  return response;
}

export async function listProxyRoutes(): Promise<ProxyRoute[]> {
  const res = await callProxyApi("/route");
  return res.json();
}

export async function createProxyRoute(
  input: CreateProxyRouteInput,
): Promise<ProxyRoute> {
  const res = await callProxyApi("/route", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateProxyRoute(
  id: string,
  input: UpdateProxyRouteInput,
): Promise<ProxyRoute> {
  return callProxyApi(`/route/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }).then((res) => res.json())
    .catch((error: ProxyApiError) => getProxyErrorInfo(error));
}

export async function deleteProxyRoute(id: string): Promise<ProxyRoute> {
  return callProxyApi(`/route/${id}`, {
    method: "DELETE",
  }).then((res) => res.json())
    .catch((error: ProxyApiError) => getProxyErrorInfo(error));
}

export function getProxyErrorInfo(
  error: unknown,
): { status: number; details: string } {
  if (typeof error === "object" && error !== null) {
    const e = error as ProxyErrorLike;
    const status =
      typeof e.status === "number" && e.status > 0 ? e.status : 500;
    const detailValue =
      typeof e.details === "string"
        ? e.details
        : e.message ?? JSON.stringify(e);
    return { status, details: detailValue };
  }
  return { status: 500, details: String(error) };
}


