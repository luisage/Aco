import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "No autorizado" }, { status: 403 });

    const dias = parseInt(req.nextUrl.searchParams.get("dias") ?? "7");
    const alumnoIdParam = req.nextUrl.searchParams.get("alumnoId");
    const alumnoId = alumnoIdParam ? parseInt(alumnoIdParam) : null;
    const hoy = new Date();
    const desde = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - (dias - 1)));

    const asistencias = await prisma.asistencia.findMany({
      where: {
        fecha: { gte: desde },
        ...(alumnoId ? { alumnoId } : {}),
      },
      select: { fecha: true },
    });

    // Agrupar por día
    const conteo: Record<string, number> = {};
    for (let i = 0; i < dias; i++) {
      const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - (dias - 1 - i)));
      const key = d.toISOString().split("T")[0];
      conteo[key] = 0;
    }
    for (const a of asistencias) {
      const key = new Date(a.fecha).toISOString().split("T")[0];
      if (key in conteo) conteo[key] = alumnoId ? 1 : conteo[key] + 1;
    }

    const data = Object.entries(conteo).map(([fecha, total]) => {
      const d = new Date(fecha + "T00:00:00Z");
      const label = d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
      return { fecha, label, total };
    });

    return Response.json(data);
  } catch (err) {
    console.error("[GET /api/reportes/asistencia]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
