"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ahoraEnMexico } from "@/lib/fechaMexico";

interface ItemVenta {
  productoId: number;
  cantidad: number;
  precioVenta: number;
}

export async function registrarVenta(items: ItemVenta[], metodoPago: "EFECTIVO" | "TRANSFERENCIA") {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const total = items.reduce((sum, i) => sum + i.precioVenta * i.cantidad, 0);

  await prisma.$transaction(async (tx) => {
    await tx.venta.create({
      data: {
        fecha: ahoraEnMexico(),
        total,
        metodoPago,
        usuarioId: session.userId,
        detalles: {
          create: items.map((i) => ({
            cantidad: i.cantidad,
            precioVenta: i.precioVenta,
            subtotal: i.precioVenta * i.cantidad,
            productoId: i.productoId,
          })),
        },
      },
    });

    for (const i of items) {
      await tx.productos.update({
        where: { id: i.productoId },
        data: { cantidad: { decrement: i.cantidad } },
      });
    }
  });

  return { ok: true };
}
