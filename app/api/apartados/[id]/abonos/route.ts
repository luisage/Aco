import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ahoraEnMexico } from "@/lib/fechaMexico";
import { liquidarApartadoSiCompleto } from "@/lib/apartados";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const apartadoId = parseInt(id, 10);

  const { monto, metodoPago, notas } = await req.json() as {
    monto: number;
    metodoPago?: "EFECTIVO" | "TRANSFERENCIA";
    notas?: string;
  };

  if (!monto || monto <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  const apartado = await prisma.apartado.findUnique({ where: { id: apartadoId } });
  if (!apartado) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (apartado.estado !== "PENDIENTE") {
    return NextResponse.json({ error: "El apartado ya no admite abonos." }, { status: 400 });
  }

  const falta = Number(apartado.total) - Number(apartado.totalAbonado);
  if (monto > falta) {
    return NextResponse.json({ error: "El monto no puede ser mayor al saldo pendiente." }, { status: 400 });
  }

  const actualizado = await prisma.$transaction(async (tx) => {
    await tx.abonoApartado.create({
      data: {
        apartadoId,
        monto,
        metodoPago: metodoPago ?? "EFECTIVO",
        fechaPago: ahoraEnMexico(),
        notas: notas || null,
        usuarioId: session.userId,
      },
    });

    await tx.apartado.update({
      where: { id: apartadoId },
      data: { totalAbonado: { increment: monto } },
    });

    return liquidarApartadoSiCompleto(tx, apartadoId, session.userId);
  });

  return NextResponse.json({
    estado: actualizado.estado,
    totalAbonado: Number(actualizado.totalAbonado),
    falta: Math.max(0, Number(actualizado.total) - Number(actualizado.totalAbonado)),
  });
}
