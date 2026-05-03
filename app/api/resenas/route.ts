import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const estado = (req.nextUrl.searchParams.get("estado") ?? "PENDIENTE") as
    | "PENDIENTE"
    | "VISIBLE"
    | "OCULTA";

  const resenas = await prisma.resena.findMany({
    where: { estado },
    orderBy: { creadoEn: "desc" },
  });

  return Response.json(resenas);
}
