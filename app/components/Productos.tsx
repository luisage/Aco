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
    const raw = await prisma.productos.findMany({
      where: { estatus: true, NOT: { categoria: "Tienda" } },
      orderBy: { id: "desc" },
      take: 12,
    });
    productos = raw.map((p) => ({ ...p, costo: Number(p.costo) }));
  } catch {
    return null;
  }

  if (productos.length === 0) return null;

  return <ProductosClient productos={productos} />;
}
