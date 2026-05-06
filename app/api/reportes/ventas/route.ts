import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const desde = params.get("desde"); // YYYY-MM-DD
  const hasta = params.get("hasta"); // YYYY-MM-DD
  const filtro = params.get("filtro") ?? "todos"; // todos | tienda | productos

  const fechaDesde = desde ? new Date(`${desde}T00:00:00`) : new Date(new Date().setHours(0, 0, 0, 0));
  const fechaHasta = hasta ? new Date(`${hasta}T23:59:59`) : new Date(new Date().setHours(23, 59, 59, 999));

  // Filtro por categoría de producto
  let categoriaWhere: object | undefined;
  if (filtro === "tienda")    categoriaWhere = { categoria: "Tienda" };
  if (filtro === "productos") categoriaWhere = { NOT: { categoria: "Tienda" } };

  const ventas = await prisma.venta.findMany({
    where: {
      fecha: { gte: fechaDesde, lte: fechaHasta },
      estatus: true,
      ...(categoriaWhere && {
        detalles: { some: { producto: categoriaWhere } },
      }),
    },
    include: {
      detalles: {
        include: { producto: { select: { id: true, nombre: true, categoria: true } } },
        ...(categoriaWhere && { where: { producto: categoriaWhere } }),
      },
    },
    orderBy: { fecha: "desc" },
  });

  const data = ventas
    .filter((v) => v.detalles.length > 0)
    .map((v) => ({
      id: v.id,
      fecha: v.fecha.toISOString(),
      total: Number(v.total),
      metodoPago: v.metodoPago,
      detalles: v.detalles.map((d) => ({
        id: d.id,
        productoId: d.productoId,
        nombre: d.producto.nombre,
        categoria: d.producto.categoria,
        cantidad: d.cantidad,
        precioVenta: Number(d.precioVenta),
        subtotal: Number(d.subtotal),
      })),
    }));

  return Response.json(data);
}
