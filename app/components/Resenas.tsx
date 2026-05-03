import { prisma } from "@/lib/prisma";
import ResenasClient from "./ResenasClient";
import FormResena from "./FormResena";

export default async function Resenas() {
  let resenas: { id: number; calificacion: number; comentario: string; creadoEn: Date }[] = [];
  try {
    resenas = await prisma.resena.findMany({
      where: { estado: "VISIBLE" },
      orderBy: { creadoEn: "desc" },
      take: 18,
    });
  } catch {
    // Si no hay DB, aún se muestra el formulario
  }

  return (
    <section id="resenas" className="bg-[#0a0a0a] py-16 sm:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-center font-black uppercase"
          style={{ fontSize: 42, color: "#c9a227", letterSpacing: 6, marginBottom: 56 }}
        >
          Reseñas
        </h2>

        {resenas.length > 0 ? (
          <ResenasClient resenas={resenas} />
        ) : (
          <p className="text-gray-500 text-center mb-16 text-sm">
            Sé el primero en dejarnos tu reseña.
          </p>
        )}

        {/* Formulario */}
        <div className="max-w-xl mx-auto mt-16">
          <h3 className="text-white text-xl font-bold text-center mb-6">
            Deja tu reseña
          </h3>
          <FormResena />
        </div>
      </div>
    </section>
  );
}
