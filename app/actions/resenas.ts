"use server";
import { prisma } from "@/lib/prisma";

export async function enviarResena(
  _prev: { ok: boolean; error: string },
  formData: FormData
) {
  const comentario = (formData.get("comentario") as string | null)?.trim() ?? "";
  const calificacion = Number(formData.get("calificacion"));

  if (!comentario) {
    return { ok: false, error: "Por favor escribe un comentario." };
  }
  if (!calificacion || calificacion < 1 || calificacion > 5) {
    return { ok: false, error: "Por favor selecciona una calificación." };
  }

  await prisma.resena.create({
    data: { comentario, calificacion, estado: "PENDIENTE" },
  });

  return { ok: true, error: "" };
}

export async function editarResena(
  id: number,
  data: { calificacion: number; comentario: string; estado: "PENDIENTE" | "VISIBLE" | "OCULTA" }
) {
  return prisma.resena.update({ where: { id }, data });
}

export async function cambiarEstadoResena(
  id: number,
  estado: "PENDIENTE" | "VISIBLE" | "OCULTA"
) {
  return prisma.resena.update({ where: { id }, data: { estado } });
}
