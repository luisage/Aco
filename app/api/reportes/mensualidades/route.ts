import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ahoraEnMexico } from "@/lib/fechaMexico";

function mxNow() {
  const mx = ahoraEnMexico();
  return { year: mx.getUTCFullYear(), month: mx.getUTCMonth(), day: mx.getUTCDate() };
}

function fmtDateUTC(d: Date) {
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", timeZone: "UTC" });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const periodo = req.nextUrl.searchParams.get("periodo") ?? "mensual";

  if (periodo === "mensual") {
    const { year, month } = mxNow();

    // Build the last 12 month keys (including current)
    const meses: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(year, month - i, 1));
      meses.push(
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      );
    }

    const pagos = await prisma.pago.findMany({
      where: { mesCorrespondiente: { gte: meses[0] } },
      select: { mesCorrespondiente: true, monto: true },
    });

    const agrupado: Record<string, { total: number; cantidad: number }> = {};
    for (const mes of meses) agrupado[mes] = { total: 0, cantidad: 0 };
    for (const p of pagos) {
      if (agrupado[p.mesCorrespondiente]) {
        agrupado[p.mesCorrespondiente].total    += p.monto;
        agrupado[p.mesCorrespondiente].cantidad += 1;
      }
    }

    return Response.json(
      meses.map((mes) => ({
        periodo: mes,
        label: new Date(`${mes}-15T00:00:00Z`).toLocaleDateString("es-MX", {
          month: "short", year: "numeric", timeZone: "UTC",
        }),
        total:    agrupado[mes].total,
        cantidad: agrupado[mes].cantidad,
      }))
    );
  }

  // Semanal: 4 semanas de 7 días hacia atrás desde hoy (México)
  const { year, month, day } = mxNow();
  const hoy = new Date(Date.UTC(year, month, day));

  const semanas: { inicio: Date; fin: Date }[] = [];
  for (let i = 3; i >= 0; i--) {
    const fin   = new Date(hoy);
    fin.setUTCDate(hoy.getUTCDate() - i * 7);
    const inicio = new Date(fin);
    inicio.setUTCDate(fin.getUTCDate() - 6);
    semanas.push({ inicio, fin });
  }

  const pagos = await prisma.pago.findMany({
    where: { fechaPago: { gte: semanas[0].inicio, lte: hoy } },
    select: { fechaPago: true, monto: true },
  });

  const data = semanas.map(({ inicio, fin }, i) => {
    const pagosSemana = pagos.filter((p) => {
      const fp = new Date(p.fechaPago);
      return fp >= inicio && fp <= fin;
    });
    return {
      periodo: `semana-${i}`,
      label:   `${fmtDateUTC(inicio)} – ${fmtDateUTC(fin)}`,
      total:    pagosSemana.reduce((s, p) => s + p.monto, 0),
      cantidad: pagosSemana.length,
    };
  });

  return Response.json(data);
}
