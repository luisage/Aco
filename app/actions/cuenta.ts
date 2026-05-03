"use server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function cambiarContrasena(
  contrasenaActual: string,
  nuevaContrasena: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "No autorizado." };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { ok: false, error: "Usuario no encontrado." };

  const valida = await compare(contrasenaActual, user.password);
  if (!valida) return { ok: false, error: "La contraseña actual es incorrecta." };

  const hashed = await hash(nuevaContrasena, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return { ok: true };
}
