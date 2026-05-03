"use server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export async function crearProducto(data: {
  nombre: string;
  descripcion: string;
  descripcionVenta?: string | null;
  cantidad: number;
  costo: number;
  categoria: string;
  imagen?: string | null;
  publicId?: string | null;
}) {
  return prisma.productos.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      descripcionVenta: data.descripcionVenta ?? null,
      cantidad: data.cantidad,
      costo: data.costo,
      categoria: data.categoria,
      imagen: data.imagen ?? null,
      publicId: data.publicId ?? null,
      estatus: true,
    },
  });
}

export async function editarProducto(
  id: number,
  data: {
    nombre: string;
    descripcion: string;
    descripcionVenta?: string | null;
    cantidad: number;
    costo: number;
    categoria: string;
    imagen?: string | null;
    publicId?: string | null;
    estatus: boolean;
  },
  oldPublicId?: string | null
) {
  if (oldPublicId && oldPublicId !== (data.publicId ?? null)) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch {
      // non-fatal: continuar aunque falle el borrado
    }
  }
  return prisma.productos.update({ where: { id }, data });
}
