"use server";
import { prisma } from "@/lib/prisma";

export interface NovedadData {
  titulo: string;
  descripcion: string;
  vigencia?: string;
  estatus: boolean;
}

export async function crearNovedad(data: NovedadData) {
  return prisma.novedades.create({ data });
}

export async function toggleNovedadEstatus(id: number, estatus: boolean) {
  return prisma.novedades.update({ where: { id }, data: { estatus } });
}

export async function editarNovedad(
  id: number,
  data: { titulo: string; descripcion: string; vigencia?: string }
) {
  return prisma.novedades.update({ where: { id }, data });
}
