"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type ActionState = {
  error?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
} | null;

export async function loginAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData.entries());
  
  const validatedFields = LoginSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@proxy.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (
    validatedFields.data.email === ADMIN_EMAIL &&
    validatedFields.data.password === ADMIN_PASSWORD
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
