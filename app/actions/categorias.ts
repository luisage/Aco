"use server";
import { prisma } from "@/lib/prisma";

export async function crearCategoria(nombre: string) {
  return prisma.categoriaProducto.create({
    data: { nombre, estatus: true },
  });
}

export async function editarCategoria(
  id: number,
  data: { nombre: string; estatus: boolean }
) {
  return prisma.categoriaProducto.update({ where: { id }, data });
}
