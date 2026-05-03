import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function getMesCorrespondiente(date: Date): string {
  const day   = date.getUTCDate();
  const month = date.getUTCMonth();
  const year  = date.getUTCFullYear();
  if (day >= 28) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    return `${ny}-${String(nm + 1).padStart(2, "0")}`;
  }
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function getRangoExtra(date: Date): "1 - 10" | "11 - 23" | null {
  const day = date.getUTCDate();
  if (day >= 28 || day <= 5) return null;
  const diasTarde = day - 5;
  if (diasTarde <= 10) return "1 - 10";
  if (diasTarde <= 22) return "11 - 23"; // días 16-27 = 11-22 días tarde
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: "No autorizado" }, { status: 403 });

    const alumnoId = parseInt(req.nextUrl.searchParams.get("alumnoId") ?? "");
    if (isNaN(alumnoId)) return Response.json({ error: "ID inválido" }, { status: 400 });

    const alumno = await prisma.alumno.findUnique({
      where: { id: alumnoId },
      select: { id: true, nombre: true, apellido: true, mensualidad: true },
    });
    if (!alumno) return Response.json({ error: "Alumno no encontrado" }, { status: 404 });

    const hoy = new Date();
    const mesCorrespondiente = getMesCorrespondiente(hoy);
    const [mesYear, mesMonth] = mesCorrespondiente.split("-");
    const mesLabel = `${MESES[parseInt(mesMonth) - 1]} ${mesYear}`;

    // ¿Ya está completamente pagado?
    const yaCompletado = await prisma.pagoMesAlumno.findFirst({
      where: { alumnoId, mes: mesCorrespondiente },
    });

    // Pagos del mes
    const pagosDelMes = await prisma.pago.findMany({
      where: { alumnoId, mesCorrespondiente },
      select: { id: true, monto: true, fechaPago: true, estadoPago: true, metodoPago: true },
      orderBy: { fechaPago: "asc" },
    });
    const totalPagado = pagosDelMes.reduce((s, p) => s + p.monto, 0);

    // Costo extra por retraso
    const rangoExtra = getRangoExtra(hoy);
    let costoExtra = 0;
    let extraDescripcion: string | null = null;
    if (rangoExtra) {
      const extra = await prisma.costoExtraMensualidad.findFirst({ where: { dias: rangoExtra } });
      if (extra) { costoExtra = extra.costo; extraDescripcion = extra.descripcion; }
    }

    const costoBase  = Number(alumno.mensualidad);
    const costoTotal = costoBase + costoExtra;
    const faltaPagar = Math.max(0, costoTotal - totalPagado);

    return Response.json({
      alumno: { id: alumno.id, nombre: alumno.nombre, apellido: alumno.apellido },
      mesCorrespondiente,
      mesLabel,
      costoBase,
      costoExtra,
      extraDescripcion,
      costoTotal,
      yaCompletado: !!yaCompletado,
      pagosDelMes: pagosDelMes.map((p) => ({
        ...p,
        fechaPago: p.fechaPago.toISOString().split("T")[0],
      })),
      totalPagado,
      faltaPagar,
    });
  } catch (err) {
    console.error("[GET /api/pagos/info]", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
