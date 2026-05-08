import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { fechaHoyMexico } from "@/lib/fechaMexico";

type Params = { params: Promise<{ id: string; alumnoId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id, alumnoId } = await params;
  const eventoId  = parseInt(id);
  const aluId     = parseInt(alumnoId);

  const registro = await prisma.alumnoEvento.findUnique({
    where: { alumnoId_eventoId: { alumnoId: aluId, eventoId } },
    include: {
      evento:      { select: { costo: true } },
      pagosEvento: { orderBy: { fechaPago: "asc" } },
    },
  });

  if (!registro) return NextResponse.json({ error: "No inscrito" }, { status: 404 });

  const totalPagado = registro.pagosEvento.reduce((s, p) => s + p.monto, 0);
  const costo       = registro.evento.costo;

  return NextResponse.json({
    alumnoEventoId: registro.id,
    costo,
    totalPagado,
    falta:   Math.max(0, costo - totalPagado),
    pagado:  registro.pagado,
    historial: registro.pagosEvento.map((p) => ({
      id:           p.id,
      monto:        p.monto,
      metodoPago:   p.metodoPago,
      fechaPago:    p.fechaPago,
      notas:        p.notas,
      registradoPor: p.registradoPor,
    })),
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, alumnoId } = await params;
  const eventoId = parseInt(id);
  const aluId    = parseInt(alumnoId);

  const { monto, metodoPago, notas } = await req.json();
  if (!monto || monto <= 0) return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

  const registro = await prisma.alumnoEvento.findUnique({
    where: { alumnoId_eventoId: { alumnoId: aluId, eventoId } },
    include: {
      evento:      { select: { costo: true } },
      pagosEvento: { select: { monto: true } },
    },
  });

  if (!registro) return NextResponse.json({ error: "No inscrito" }, { status: 404 });

  const totalPrevio = registro.pagosEvento.reduce((s, p) => s + p.monto, 0);
  const nuevoTotal  = totalPrevio + monto;
  const estaCompleto = nuevoTotal >= registro.evento.costo;

  await prisma.$transaction(async (tx) => {
    await tx.pagoEvento.create({
      data: {
        alumnoEventoId: registro.id,
        monto,
        metodoPago:    metodoPago ?? "EFECTIVO",
        fechaPago:     fechaHoyMexico(),
        notas:         notas || null,
        registradoPor: session.nombre ?? session.usuario ?? null,
      },
    });

    if (estaCompleto && !registro.pagado) {
      await tx.alumnoEvento.update({
        where: { id: registro.id },
        data:  { pagado: true },
      });
    }
  });

  return NextResponse.json({
    totalPagado: nuevoTotal,
    falta:       Math.max(0, registro.evento.costo - nuevoTotal),
    pagado:      estaCompleto,
  });
}
