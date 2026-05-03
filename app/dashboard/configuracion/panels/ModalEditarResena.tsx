"use client";
import { useRef, useState } from "react";
import { editarResena } from "@/app/actions/resenas";

type EstadoResena = "PENDIENTE" | "VISIBLE" | "OCULTA";

interface Resena {
  id: number;
  calificacion: number;
  comentario: string;
  estado: EstadoResena;
  fecha: string;
  creadoEn: string;
}

interface Props {
  resena: Resena;
  onClose: () => void;
  onUpdated: (r: Resena) => void;
}

export default function ModalEditarResena({ resena, onClose, onUpdated }: Props) {
  const [calificacion, setCalificacion] = useState(resena.calificacion);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const comentario = (fd.get("comentario") as string).trim();
    const estado = fd.get("estado") as EstadoResena;

    if (!comentario) { setError("El comentario es obligatorio."); return; }
    if (!calificacion || calificacion < 1 || calificacion > 5) { setError("Selecciona una calificación."); return; }

    setLoading(true);
    try {
      const actualizada = await editarResena(resena.id, { calificacion, comentario, estado });
      onUpdated({
        ...actualizada,
        fecha:    actualizada.fecha instanceof Date ? actualizada.fecha.toISOString() : String(actualizada.fecha),
        creadoEn: actualizada.creadoEn instanceof Date ? actualizada.creadoEn.toISOString() : String(actualizada.creadoEn),
      });
    } catch {
      setError("Error al actualizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl">
          <h2 className="text-[#0d0d0d] font-bold text-lg">Editar reseña</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Calificación */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Calificación <span className="text-[#C8102E]">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCalificacion(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    i <= (hover || calificacion) ? "text-[#D4A017]" : "text-gray-400"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Comentario <span className="text-[#C8102E]">*</span>
            </label>
            <textarea
              name="comentario"
              required
              rows={4}
              defaultValue={resena.comentario}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors resize-none"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Estado <span className="text-[#C8102E]">*</span>
            </label>
            <select
              name="estado"
              defaultValue={resena.estado}
              className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="VISIBLE">Visible</option>
              <option value="OCULTA">Oculta</option>
            </select>
          </div>

          {error && (
            <p className="text-[#C8102E] text-sm bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
