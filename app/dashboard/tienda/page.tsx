import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import TiendaClient from "./TiendaClient";

export default async function TiendaPage() {
  const [session, raw] = await Promise.all([
    getSession(),
    prisma.productos.findMany({
      where: { categoria: "Tienda" },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, descripcion: true, costo: true, cantidad: true, estatus: true },
    }),
  ]);

  const dulces = raw.map((d) => ({ ...d, costo: Number(d.costo) }));

  return <TiendaClient dulcesIniciales={dulces} role={session?.role ?? ""} />;
}
