import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return Response.json([]);

  const isId = /^\d+$/.test(q);

  const productos = await prisma.productos.findMany({
    where: {
      estatus: true,
      ...(isId
        ? { id: parseInt(q, 10) }
        : { nombre: { contains: q, mode: "insensitive" } }),
    },
    select: { id: true, nombre: true, costo: true, cantidad: true, categoria: true },
    take: 10,
    orderBy: { nombre: "asc" },
  });

  return Response.json(productos.map((p) => ({ ...p, costo: Number(p.costo) })));
}
