"use server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export interface NovedadData {
  titulo: string;
  descripcion: string;
  vigencia?: string;
  estatus: boolean;
  imagen?: string | null;
  publicId?: string | null;
}

export async function crearNovedad(data: NovedadData) {
  return prisma.novedades.create({ data });
}

export async function toggleNovedadEstatus(id: number, estatus: boolean) {
  return prisma.novedades.update({ where: { id }, data: { estatus } });
}

export async function editarNovedad(
  id: number,
  data: { titulo: string; descripcion: string; vigencia?: string; imagen?: string | null; publicId?: string | null },
  oldPublicId?: string | null
) {
  if (oldPublicId && oldPublicId !== (data.publicId ?? null)) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch {
      // non-fatal
    }
  }
  return prisma.novedades.update({ where: { id }, data });
}
