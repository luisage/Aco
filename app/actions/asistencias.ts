"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ahoraEnMexico, fechaHoyMexico } from "@/lib/fechaMexico";

export async function registrarAsistencia(alumnoId: number) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  try {
    await prisma.asistencia.create({
      data: { alumnoId, fecha: fechaHoyMexico(), horaEntrada: ahoraEnMexico() },
    });
  } catch {
    // Restricción unique: ya existe la asistencia de hoy, no hacer nada
  }

  return { ok: true };
}

export async function quitarAsistencia(alumnoId: number) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  await prisma.asistencia.deleteMany({
    where: { alumnoId, fecha: fechaHoyMexico() },
  });

  return { ok: true };
}
