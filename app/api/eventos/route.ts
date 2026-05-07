import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const eventos = await prisma.evento.findMany({
    include: { _count: { select: { alumnos: true } } },
    orderBy: { fecha: "asc" },
  });

  return Response.json(eventos.map((e) => ({ ...e, fecha: e.fecha.toISOString() })));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { nombre, tipoEvento, fecha, hora, costo, estado, ciudad, ubicacion, descripcion } = body;

  if (!nombre || !tipoEvento || !fecha || costo === undefined) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const evento = await prisma.evento.create({
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

  return Response.json({ ...evento, fecha: evento.fecha.toISOString() }, { status: 201 });
}
