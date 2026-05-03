"use server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export async function crearImagenCarrusel(data: {
  nombre?: string | null;
  url: string;
  publicId?: string | null;
}) {
  return prisma.imagenCarrusel.create({
    data: {
      nombre: data.nombre ?? null,
      url: data.url,
      publicId: data.publicId ?? null,
      estatus: true,
    },
  });
}

export async function editarImagenCarrusel(
  id: number,
  data: {
    nombre?: string | null;
    url: string;
    publicId?: string | null;
    estatus: boolean;
  },
  oldPublicId?: string | null
) {
  if (oldPublicId && oldPublicId !== (data.publicId ?? null)) {
    try { await cloudinary.uploader.destroy(oldPublicId); } catch {}
  }
  return prisma.imagenCarrusel.update({ where: { id }, data });
}

export async function eliminarImagenCarrusel(id: number, publicId?: string | null) {
  if (publicId) {
    try { await cloudinary.uploader.destroy(publicId); } catch {}
  }
  return prisma.imagenCarrusel.delete({ where: { id } });
}
