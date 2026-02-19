import { NextResponse } from "next/server";
import {
  createProxyRoute,
  getProxyErrorInfo,
  listProxyRoutes,
} from "@/services/proxyService";

export async function GET() {
  try {
    const data = await listProxyRoutes();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Erro ao conectar com o serviço de proxy:", error);
    const { status, details } = getErrorInfo(error);
    return NextResponse.json(
      {
        error: "Falha ao buscar proxies",
        details,
      },
      { status },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.url) {
      return NextResponse.json(
        { error: 'Campos "name" e "url" são obrigatórios' },
        { status: 400 },
      );
    }

    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: "URL inválida" },
        { status: 400 },
      );
    }

    const data = await createProxyRoute({
      name: body.name,
      url: body.url,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao criar proxy:", error);
    const { status, details } = getProxyErrorInfo(error);
    return NextResponse.json(
      {
        error: "Erro interno ao criar proxy",
        details,
      },
      { status },
    );
  }
}
