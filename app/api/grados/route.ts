import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "No autorizado" }, { status: 403 });

    const grados = await prisma.grados.findMany({
      where: { estatus: true },
      select: { id: true, nombre: true },
      orderBy: { orden: "asc" },
    });

    return Response.json(grados);
  } catch (err) {
    console.error("[GET /api/grados]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
