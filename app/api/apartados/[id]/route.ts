import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const apartadoId = parseInt(id, 10);

  const apartado = await prisma.apartado.findUnique({
    where: { id: apartadoId },
    include: {
      alumno: { select: { nombre: true, apellido: true, telefono: true } },
      detalles: { include: { producto: { select: { nombre: true } } } },
      abonos: { orderBy: { fechaPago: "asc" } },
    },
  });

  if (!apartado) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({
    id: apartado.id,
    alumno: apartado.alumno,
    fechaApartado: apartado.fechaApartado,
    fechaLiquidacion: apartado.fechaLiquidacion,
    estado: apartado.estado,
    total: Number(apartado.total),
    totalAbonado: Number(apartado.totalAbonado),
    falta: Math.max(0, Number(apartado.total) - Number(apartado.totalAbonado)),
    detalles: apartado.detalles.map((d) => ({
      id: d.id,
      nombre: d.producto.nombre,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precioUnitario),
      subtotal: Number(d.subtotal),
    })),
    abonos: apartado.abonos.map((a) => ({
      id: a.id,
      monto: Number(a.monto),
      metodoPago: a.metodoPago,
      fechaPago: a.fechaPago,
      notas: a.notas,
    })),
  });
}
