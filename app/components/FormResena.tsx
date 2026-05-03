"use client";
import { useActionState, useState } from "react";
import { enviarResena } from "@/app/actions/resenas";

const initialState = { ok: false, error: "" };

export default function FormResena() {
  const [state, formAction, pending] = useActionState(enviarResena, initialState);
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.ok) {
    return (
      <div className="bg-[#003087]/20 border border-[#003087]/40 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-white font-semibold">¡Gracias por tu reseña!</p>
        <p className="text-gray-400 text-sm mt-1">
          La revisaremos y la publicaremos pronto.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
      {/* Calificación */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
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
                i <= (hover || calificacion)
                  ? "text-[#D4A017]"
                  : "text-gray-600"
              }`}
              aria-label={`${i} estrellas`}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" name="calificacion" value={calificacion} />
      </div>

      {/* Comentario */}
      <div>
        <label htmlFor="comentario" className="block text-gray-300 text-sm font-medium mb-2">
          Comentario <span className="text-[#C8102E]">*</span>
        </label>
        <textarea
          id="comentario"
          name="comentario"
          rows={4}
          placeholder="Cuéntanos tu experiencia en ACO Doyang..."
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4A017] transition-colors resize-none"
          required
        />
      </div>

      {state.error && (
        <p className="text-[#C8102E] text-sm">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || calificacion === 0}
        className="w-full py-3 bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm"
      >
        {pending ? "Enviando..." : "Enviar reseña"}
      </button>
    </form>
  );
}
