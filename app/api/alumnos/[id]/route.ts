import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "No autorizado" }, { status: 403 });

    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return Response.json({ error: "ID inválido" }, { status: 400 });

    const alumno = await prisma.alumno.findUnique({
      where: { id },
      include: {
        tutores: true,
        personasAutorizadas: true,
        expectativas: { select: { tipo: true } },
      },
    });

    if (!alumno) return Response.json({ error: "No encontrado" }, { status: 404 });

    return Response.json({
      ...alumno,
      mensualidad: Number(alumno.mensualidad),
      fechaNacimiento: alumno.fechaNacimiento.toISOString().split("T")[0],
      fechaInscripcion: alumno.fechaInscripcion.toISOString().split("T")[0],
      creadoEn: alumno.creadoEn.toISOString(),
    });
  } catch (err) {
    console.error("[GET /api/alumnos/[id]]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
