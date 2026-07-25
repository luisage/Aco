import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const desde = params.get("desde"); // YYYY-MM-DD
  const hasta = params.get("hasta"); // YYYY-MM-DD

  const fechaDesde = desde ? new Date(`${desde}T00:00:00`) : new Date(new Date().setHours(0, 0, 0, 0));
  const fechaHasta = hasta ? new Date(`${hasta}T23:59:59`) : new Date(new Date().setHours(23, 59, 59, 999));

  const eventos = await prisma.evento.findMany({
    where: {
      tipoEvento: "EXAMEN",
      fecha: { gte: fechaDesde, lte: fechaHasta },
    },
    include: { _count: { select: { alumnos: true } } },
    orderBy: { fecha: "desc" },
  });

  const data = eventos.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    fecha: e.fecha.toISOString(),
    totalAlumnos: e._count.alumnos,
  }));

  return Response.json(data);
}
