import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "No autorizado" }, { status: 403 });

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!q) return Response.json([]);

    const alumnos = await prisma.alumno.findMany({
      where: {
        estado: "ACTIVO",
        OR: [
          { nombre:   { contains: q, mode: "insensitive" } },
          { apellido: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, nombre: true, apellido: true, telefono: true },
      orderBy: { nombre: "asc" },
      take: 8,
    });

    return Response.json(alumnos);
  } catch (err) {
    console.error("[GET /api/alumnos/buscar]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
