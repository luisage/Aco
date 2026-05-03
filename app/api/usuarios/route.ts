import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPERADMIN")
      return Response.json({ error: "No autorizado" }, { status: 403 });

    const param = req.nextUrl.searchParams.get("estatus");
    const estatus = param === null ? undefined : param === "true";

    const usuarios = await prisma.user.findMany({
      where: estatus === undefined ? undefined : { estatus },
      select: { id: true, usuario: true, nombre: true, apellido: true, role: true, estatus: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(usuarios);
  } catch (err) {
    console.error("[GET /api/usuarios]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
