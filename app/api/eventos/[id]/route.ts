import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const eventoId = parseInt(id);
  if (isNaN(eventoId)) return Response.json({ error: "ID inválido" }, { status: 400 });

  const body = await req.json();
  const { nombre, tipoEvento, fecha, hora, costo, estado, ciudad, ubicacion, descripcion } = body;

  if (!nombre || !tipoEvento || !fecha || costo === undefined) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const evento = await prisma.evento.update({
    where: { id: eventoId },
    data: {
      nombre,
      tipoEvento,
      fecha: new Date(fecha + "T12:00:00Z"),
      hora:       hora       || null,
      costo:      parseInt(costo),
      estado:     estado     || null,
      ciudad:     ciudad     || null,
      ubicacion:  ubicacion  || null,
      descripcion: descripcion || null,
    },
    include: { _count: { select: { alumnos: true } } },
  });

  return Response.json({ ...evento, fecha: evento.fecha.toISOString() });
}
