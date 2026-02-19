import { NextResponse } from "next/server";
import {
  deleteProxyRoute,
  getProxyErrorInfo,
  updateProxyRoute,
} from "@/services/proxyService";
import type { NextRequest } from "next/server";

type RouteParams = {
  params: { id: string };
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const id = params.id;
  const body = await request.json().catch(() => ({
    error: "Erro ao ler o corpo da requisição",
  }));
  const data = await updateProxyRoute(id, body);
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const id = params.id;
  const data = await deleteProxyRoute(id);
  return NextResponse.json(data);
}
