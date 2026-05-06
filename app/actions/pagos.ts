"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { fechaHoyMexico } from "@/lib/fechaMexico";

interface RegistrarPagoData {
  alumnoId: number;
  monto: number;
  metodoPago: "EFECTIVO" | "TRANSFERENCIA";
  notas?: string;
  mesCorrespondiente: string;
  costoTotal: number;
  totalPagadoPrevio: number;
}

export async function registrarPago(data: RegistrarPagoData) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const { alumnoId, monto, metodoPago, notas, mesCorrespondiente, costoTotal, totalPagadoPrevio } = data;

  const nuevoTotal = totalPagadoPrevio + monto;
  const estaCompleto = nuevoTotal >= costoTotal;
  const hayParciales = totalPagadoPrevio > 0;

  try {
    await prisma.$transaction(async (tx) => {
      // Crear el nuevo pago
      await tx.pago.create({
        data: {
          alumnoId,
          fechaPago: fechaHoyMexico(),
          monto,
          metodoPago,
          mesCorrespondiente,
          estadoPago: estaCompleto ? "COMPLETO" : "PARCIAL",
          mensualidadCompleta: estaCompleto,
          notas: notas || null,
          registradoPor: session.nombre ?? session.usuario ?? null,
        },
      });

      if (estaCompleto) {
        // Si había parciales anteriores, marcarlos como mensualidadCompleta
        if (hayParciales) {
          await tx.pago.updateMany({
            where: { alumnoId, mesCorrespondiente, mensualidadCompleta: false },
            data: { mensualidadCompleta: true },
          });
        }

        // Registrar mes como pagado (upsert para evitar duplicados)
        const existe = await tx.pagoMesAlumno.findFirst({ where: { alumnoId, mes: mesCorrespondiente } });
        if (!existe) {
          await tx.pagoMesAlumno.create({ data: { alumnoId, mes: mesCorrespondiente } });
        }
      }
    });

    return { ok: true };
  } catch {
    throw new Error("Error al registrar el pago. Intenta de nuevo.");
  }
}
