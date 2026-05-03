import { prisma } from "@/lib/prisma";
import ProductosClient from "./ProductosClient";

export default async function Productos() {
  let productos: {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string | null;
    costo: number;
    categoria: string;
  }[] = [];
  try {
    productos = await prisma.productos.findMany({
      where: { estatus: true },
      orderBy: { id: "desc" },
      take: 12,
    });
  } catch {
    return null;
  }

  if (productos.length === 0) return null;

  return <ProductosClient productos={productos} />;
}
