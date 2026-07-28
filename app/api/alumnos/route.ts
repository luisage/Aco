import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ahoraEnMexico } from "@/lib/fechaMexico";

function calcularEstadoPago(
  day: number,
  mesActualKey: string,
  pagosMes: Set<string>,
): "AL_CORRIENTE" | "ATRASADO" | "ADEUDO" | "A_PAGAR" {
  const pago = pagosMes.has(mesActualKey);
  if (day >= 28) {
    // Ciclo del mes actual terminó — si ya pagó, puede pagar el siguiente mes; si no, adeuda
    return pago ? "A_PAGAR" : "ADEUDO";
  }
  if (pago) return "AL_CORRIENTE";
  if (day <= 5) return "A_PAGAR"; // ventana de gracia (días 1-5) sin pagar aún
  return "ATRASADO"; // días 6-27 sin pagar
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "No autorizado" }, { status: 403 });

    const { searchParams } = req.nextUrl;
    const estado = searchParams.get("estado") ?? "ACTIVO";
    const q = searchParams.get("q")?.trim() ?? "";

    const now = ahoraEnMexico();
    const hoyInicio = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const hoyFin   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const year  = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day   = now.getUTCDate();
    const mesActualKey = `${year}-${String(month + 1).padStart(2, "0")}`;

    const alumnos = await prisma.alumno.findMany({
      where: {
        estado: estado as "ACTIVO" | "INACTIVO" | "BAJA",
        ...(q ? {
          OR: [
            { nombre:   { contains: q, mode: "insensitive" } },
            { apellido: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q } },
          ],
        } : {}),
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fechaNacimiento: true,
        fechaInscripcion: true,
        telefono: true,
        estado: true,
        asistencias: {
          where: { fecha: { gte: hoyInicio, lt: hoyFin } },
          select: { id: true },
        },
      },
      orderBy: { fechaInscripcion: "desc" },
    });

    // Batch: traer pagos del mes actual para todos los alumnos de la lista
    const alumnoIds = alumnos.map((a) => a.id);
    const pagosMes = await prisma.pagoMesAlumno.findMany({
      where: { alumnoId: { in: alumnoIds }, mes: mesActualKey },
      select: { alumnoId: true },
    });
    const alumnosPagados = new Set(pagosMes.map((p) => p.alumnoId));

    return Response.json(
      alumnos.map(({ asistencias, ...a }) => {
        const pagosMesAlumno = new Set<string>(alumnosPagados.has(a.id) ? [mesActualKey] : []);
        return {
          ...a,
          tieneAsistenciaHoy: asistencias.length > 0,
          estadoPago: calcularEstadoPago(day, mesActualKey, pagosMesAlumno),
        };
      })
    );
  } catch (err) {
    console.error("[GET /api/alumnos]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
