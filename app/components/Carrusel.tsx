import { prisma } from "@/lib/prisma";
import CarruselClient from "./CarruselClient";

export default async function Carrusel() {
  let imagenes: { id: number; url: string; nombre: string | null }[] = [];
  try {
    imagenes = await prisma.imagenCarrusel.findMany({
      where: { estatus: true },
      select: { id: true, url: true, nombre: true },
    });
  } catch {
    return null;
  }

  if (imagenes.length === 0) return null;

  return <CarruselClient imagenes={imagenes} />;
}
