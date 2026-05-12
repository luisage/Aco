import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const mesParam = req.nextUrl.searchParams.get("mes");
  const mes = mesParam ? parseInt(mesParam) : null;
  if (!mes || mes < 1 || mes > 12) {
    return NextResponse.json({ error: "Mes inválido" }, { status: 400 });
  }

  // Año actual en zona México
  const ahoraStr = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    year: "numeric",
  }).format(new Date());
  const anioActual = parseInt(ahoraStr);

  type Row = { id: number; nombre: string; apellido: string; fecha_nacimiento: Date };

  const alumnos = await prisma.$queryRaw<Row[]>`
    SELECT id, nombre, apellido, fecha_nacimiento
    FROM alumnos
    WHERE estado = 'ACTIVO'
      AND EXTRACT(MONTH FROM fecha_nacimiento) = ${mes}
    ORDER BY EXTRACT(DAY FROM fecha_nacimiento), apellido, nombre
  `;

  return NextResponse.json(
    alumnos.map((a) => ({
      id:       a.id,
      nombre:   a.nombre,
      apellido: a.apellido,
      dia:      new Date(a.fecha_nacimiento).getUTCDate(),
      edad:     anioActual - new Date(a.fecha_nacimiento).getUTCFullYear(),
    }))
  );
}
