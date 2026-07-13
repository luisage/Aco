import { Prisma } from "@/app/generated/prisma/client";
import { ahoraEnMexico } from "@/lib/fechaMexico";

/**
 * Si el apartado ya cubre su total, genera la venta correspondiente,
 * descuenta el inventario y marca el apartado como COMPLETADO.
 * Debe llamarse siempre dentro de la misma transacción que registra el abono.
 */
export async function liquidarApartadoSiCompleto(
  tx: Prisma.TransactionClient,
  apartadoId: number,
  usuarioId: number
) {
  const apartado = await tx.apartado.findUniqueOrThrow({
    where: { id: apartadoId },
    include: { detalles: true },
  });

  if (apartado.estado !== "PENDIENTE") return apartado;
  if (Number(apartado.totalAbonado) < Number(apartado.total)) return apartado;

  const ultimoAbono = await tx.abonoApartado.findFirst({
    where: { apartadoId },
    orderBy: { fechaPago: "desc" },
  });

  const venta = await tx.venta.create({
    data: {
      fecha: ahoraEnMexico(),
      total: apartado.total,
      metodoPago: ultimoAbono?.metodoPago ?? "EFECTIVO",
      usuarioId,
      detalles: {
        create: apartado.detalles.map((d) => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          precioVenta: d.precioUnitario,
          subtotal: d.subtotal,
        })),
      },
    },
  });

  for (const d of apartado.detalles) {
    await tx.productos.update({
      where: { id: d.productoId },
      data: { cantidad: { decrement: d.cantidad } },
    });
  }

  return tx.apartado.update({
    where: { id: apartadoId },
    data: {
      estado: "COMPLETADO",
      ventaId: venta.id,
      fechaLiquidacion: ahoraEnMexico(),
    },
  });
}
