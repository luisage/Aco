import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { calcularGradoSiguiente } from "@/lib/grados";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const eventoId = parseInt(id);
  if (isNaN(eventoId)) return Response.json({ error: "ID inválido" }, { status: 400 });

  const inscritos = await prisma.alumnoEvento.findMany({
    where: { eventoId },
    include: {
      alumno:      { select: { id: true, nombre: true, apellido: true, telefono: true } },
      pagosEvento: { select: { monto: true } },
    },
    orderBy: { inscritoEn: "asc" },
  });

  return Response.json(inscritos.map((i) => ({
    id:          i.id,
    alumnoId:    i.alumnoId,
    nombre:      i.alumno.nombre,
    apellido:    i.alumno.apellido,
    telefono:    i.alumno.telefono ?? null,
    pagado:      i.pagado,
    totalPagado: i.pagosEvento.reduce((s, p) => s + p.monto, 0),
  })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const eventoId = parseInt(id);
  if (isNaN(eventoId)) return Response.json({ error: "ID inválido" }, { status: 400 });

  const { alumnoId: alumnoIdRaw } = await req.json();
  if (!alumnoIdRaw) return Response.json({ error: "alumnoId requerido" }, { status: 400 });
  const alumnoId = parseInt(alumnoIdRaw);

  try {
    const evento = await prisma.evento.findUnique({ where: { id: eventoId }, select: { tipoEvento: true } });
    if (!evento) return Response.json({ error: "Evento no encontrado" }, { status: 404 });

    // Si el evento es un examen, se calcula el grado siguiente al actual del alumno
    let grado: string | null = null;
    if (evento.tipoEvento === "EXAMEN") {
      const alumno = await prisma.alumno.findUnique({ where: { id: alumnoId }, select: { grado: true } });
      grado = await calcularGradoSiguiente(alumno?.grado ?? null);
    }

    const inscrito = await prisma.alumnoEvento.create({
      data: { alumnoId, eventoId, grado },
      include: { alumno: { select: { id: true, nombre: true, apellido: true } } },
    });
    return Response.json({
      id: inscrito.id,
      alumnoId: inscrito.alumnoId,
      nombre:   inscrito.alumno.nombre,
      apellido: inscrito.alumno.apellido,
      grado:    inscrito.grado,
    }, { status: 201 });
  } catch {
    return Response.json({ error: "El alumno ya está inscrito en este evento" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const eventoId = parseInt(id);
  const alumnoId = parseInt(req.nextUrl.searchParams.get("alumnoId") ?? "");

  if (isNaN(eventoId) || isNaN(alumnoId)) {
    return Response.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  await prisma.alumnoEvento.deleteMany({ where: { alumnoId, eventoId } });
  return Response.json({ ok: true });
}
