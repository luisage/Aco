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
    include: { alumno: { select: { id: true, nombre: true, apellido: true, grado: true } } },
    orderBy: { inscritoEn: "asc" },
  });

  return Response.json(inscritos.map((i) => ({
    id:            i.id,
    alumnoId:      i.alumnoId,
    nombreCompleto: `${i.alumno.nombre} ${i.alumno.apellido}`,
    gradoActual:   i.alumno.grado ?? "Blanca",
    resultado:     i.resultado,
  })));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const eventoId = parseInt(id);
  if (isNaN(eventoId)) return Response.json({ error: "ID inválido" }, { status: 400 });

  const { alumnoEventoId, resultado } = await req.json();
  if (!alumnoEventoId || (resultado !== "Aprobado" && resultado !== "No aprobado")) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const inscrito = await prisma.alumnoEvento.findFirst({
    where: { id: parseInt(alumnoEventoId), eventoId },
    include: { alumno: { select: { id: true, grado: true } } },
  });
  if (!inscrito) return Response.json({ error: "Alumno no encontrado en este evento" }, { status: 404 });

  // El resultado ya fue registrado: queda bloqueado, no se puede modificar
  if (inscrito.resultado !== null) {
    return Response.json({ error: "El resultado ya fue registrado y no se puede modificar" }, { status: 409 });
  }

  let gradoActual = inscrito.alumno.grado ?? "Blanca";

  if (resultado === "Aprobado") {
    const siguiente = await calcularGradoSiguiente(inscrito.alumno.grado);
    await prisma.$transaction([
      prisma.alumnoEvento.update({ where: { id: inscrito.id }, data: { resultado } }),
      ...(siguiente ? [prisma.alumno.update({ where: { id: inscrito.alumnoId }, data: { grado: siguiente } })] : []),
    ]);
    if (siguiente) gradoActual = siguiente;
  } else {
    await prisma.alumnoEvento.update({ where: { id: inscrito.id }, data: { resultado } });
  }

  return Response.json({ ok: true, resultado, gradoActual });
}
