"use server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export async function crearVideo(data: {
  nombre?: string | null;
  descripcion?: string | null;
  url: string;
  publicId: string;
  orden?: number;
}) {
  return prisma.videos.create({
    data: {
      nombre: data.nombre ?? null,
      descripcion: data.descripcion ?? null,
      url: data.url,
      publicId: data.publicId,
      orden: data.orden ?? 0,
      estatus: true,
    },
  });
}

export async function editarVideo(
  id: number,
  data: {
    nombre?: string | null;
    descripcion?: string | null;
    url: string;
    publicId: string;
    orden: number;
    estatus: boolean;
  },
  oldPublicId?: string | null
) {
  if (oldPublicId && oldPublicId !== data.publicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, { resource_type: "video" });
    } catch {}
  }
  return prisma.videos.update({ where: { id }, data });
}

export async function eliminarVideo(id: number, publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch {}
  return prisma.videos.delete({ where: { id } });
}
