import { prisma } from "@/lib/prisma";
import TiendaClient from "./TiendaClient";

export default async function TiendaPage() {
  const raw = await prisma.productos.findMany({
    where: { categoria: "Tienda" },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, descripcion: true, costo: true, cantidad: true, estatus: true },
  });

  const dulces = raw.map((d) => ({ ...d, costo: Number(d.costo) }));

  return <TiendaClient dulcesIniciales={dulces} />;
}
