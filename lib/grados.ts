import { prisma } from "@/lib/prisma";

/**
 * Devuelve el nombre del grado siguiente al actual, según el orden de la tabla `grados`.
 * Si el alumno no tiene grado asignado, se toma "Blanca" como grado actual.
 * Devuelve null si el grado actual ya es el máximo o no existe en la tabla.
 */
export async function calcularGradoSiguiente(gradoActual: string | null): Promise<string | null> {
  const actual = gradoActual ?? "Blanca";

  const grados = await prisma.grados.findMany({
    where: { estatus: true },
    orderBy: { orden: "asc" },
    select: { nombre: true },
  });

  const idx = grados.findIndex((g) => g.nombre === actual);
  return idx >= 0 && idx < grados.length - 1 ? grados[idx + 1].nombre : null;
}
