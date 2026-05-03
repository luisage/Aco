"use server";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

export async function login(
  _prev: { error: string },
  formData: FormData
) {
  const usuario = (formData.get("usuario") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!usuario || !password) {
    return { error: "Ingresa usuario y contraseña." };
  }

  const user = await prisma.user.findUnique({ where: { usuario } });

  if (!user) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  await createSession({
    userId: user.id,
    usuario: user.usuario ?? usuario,
    nombre: user.nombre,
    role: user.role,
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
