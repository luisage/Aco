import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const param = req.nextUrl.searchParams.get("estatus");
  const estatus = param === null ? undefined : param === "true";
  const categoria = req.nextUrl.searchParams.get("categoria") ?? undefined;

  const productos = await prisma.productos.findMany({
    where: {
      ...(estatus !== undefined && { estatus }),
      ...(categoria !== undefined && { categoria }),
    },
    orderBy: { nombre: "asc" },
  });

  return Response.json(productos);
}
