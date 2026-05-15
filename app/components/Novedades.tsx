import { prisma } from "@/lib/prisma";
import NovedadesClient from "./NovedadesClient";

export default async function Novedades() {
  let novedades: { id: number; titulo: string; descripcion: string; vigencia: string | null; imagen: string | null; publicId: string | null }[] = [];
  try {
    novedades = await prisma.novedades.findMany({
      where: { estatus: true },
      orderBy: { id: "desc" },
    });
  } catch {
    return null;
  }

  if (novedades.length === 0) return null;

  return <NovedadesClient novedades={novedades} />;
}
