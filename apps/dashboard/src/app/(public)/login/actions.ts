"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Usando a sintaxe mais direta do Zod conforme seu feedback
const LoginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export async function loginAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const parsed = LoginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: z.treeifyError(parsed.error),
    };
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@proxy.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (
    parsed.data.email === ADMIN_EMAIL &&
    parsed.data.password === ADMIN_PASSWORD
  ) {
    const cookieStore = await cookies();
    cookieStore.set("auth_session", "session_token_123", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    
    redirect("/proxy");
  }

  return {
    error: { _form: ["Credenciais inválidas."] },
  };
}
