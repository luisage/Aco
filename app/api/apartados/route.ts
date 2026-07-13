import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ahoraEnMexico } from "@/lib/fechaMexico";
import { liquidarApartadoSiCompleto } from "@/lib/apartados";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const apartados = await prisma.apartado.findMany({
    include: { alumno: { select: { nombre: true, apellido: true } } },
    orderBy: { fechaApartado: "desc" },
  });

  return NextResponse.json(
    apartados.map((a) => ({
      id: a.id,
      alumnoNombre: `${a.alumno.nombre} ${a.alumno.apellido}`,
      fechaApartado: a.fechaApartado,
      total: Number(a.total),
      totalAbonado: Number(a.totalAbonado),
      estado: a.estado,
    }))
  );
}

interface ProductoApartado {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { alumnoId, productos, abonoInicial } = await req.json() as {
    alumnoId: number;
    productos: ProductoApartado[];
    abonoInicial?: { monto: number; metodoPago?: "EFECTIVO" | "TRANSFERENCIA"; notas?: string };
  };

  if (!alumnoId || !Array.isArray(productos) || productos.length === 0) {
    return NextResponse.json({ error: "Selecciona un alumno y al menos un producto." }, { status: 400 });
  }

  const total = productos.reduce((s, p) => s + p.precioUnitario * p.cantidad, 0);
  const montoAbono = abonoInicial && abonoInicial.monto > 0 ? abonoInicial.monto : 0;
  if (montoAbono > total) {
    return NextResponse.json({ error: "El abono no puede ser mayor al total." }, { status: 400 });
  }

  const fecha = ahoraEnMexico();

  const apartado = await prisma.$transaction(async (tx) => {
    const creado = await tx.apartado.create({
      data: {
        alumnoId,
        total,
        totalAbonado: montoAbono,
        usuarioId: session.userId,
        fechaApartado: fecha,
        detalles: {
          create: productos.map((p) => ({
            productoId: p.productoId,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario,
            subtotal: p.precioUnitario * p.cantidad,
          })),
        },
        ...(montoAbono > 0 ? {
          abonos: {
            create: [{
              monto: montoAbono,
              metodoPago: abonoInicial?.metodoPago ?? "EFECTIVO",
              fechaPago: fecha,
              notas: abonoInicial?.notas || null,
              usuarioId: session.userId,
            }],
          },
        } : {}),
      },
    });

    const final = await liquidarApartadoSiCompleto(tx, creado.id, session.userId);
    return final;
  });

  const alumno = await prisma.alumno.findUniqueOrThrow({
    where: { id: alumnoId },
    select: { nombre: true, apellido: true },
  });

  return NextResponse.json({
    id: apartado.id,
    alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
    fechaApartado: apartado.fechaApartado,
    total: Number(apartado.total),
    totalAbonado: Number(apartado.totalAbonado),
    estado: apartado.estado,
  });
}
