"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function registrarAsistencia(alumnoId: number) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const ahora = new Date();
  const fecha = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));

  try {
    await prisma.asistencia.create({
      data: { alumnoId, fecha, horaEntrada: ahora },
    });
  } catch {
    // Restricción unique: ya existe la asistencia de hoy, no hacer nada
  }

  return { ok: true };
}
