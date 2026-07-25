"use client";
import { useEffect, useState } from "react";

interface AlumnoExamen {
  id: number;
  alumnoId: number;
  nombreCompleto: string;
  gradoActual: string;
  resultado: string | null;
}

export default function ModalDetalleExamen({
  eventoId,
  eventoNombre,
  onClose,
}: {
  eventoId: number;
  eventoNombre: string;
  onClose: () => void;
}) {
  const [alumnos, setAlumnos] = useState<AlumnoExamen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`/api/eventos/${eventoId}/examen`)
      .then((r) => r.json())
      .then((d) => setAlumnos(Array.isArray(d) ? d : []))
      .finally(() => setCargando(false));
  }, [eventoId]);

  async function calificar(alumnoEventoId: number, resultado: "Aprobado" | "No aprobado") {
    setGuardando((prev) => new Set(prev).add(alumnoEventoId));
    try {
      const res = await fetch(`/api/eventos/${eventoId}/examen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alumnoEventoId, resultado }),
      });
      const json = await res.json();
      if (res.ok) {
        setAlumnos((prev) =>
          prev.map((a) =>
            a.id === alumnoEventoId
              ? { ...a, resultado: json.resultado, gradoActual: json.gradoActual }
              : a
          )
        );
      }
    } finally {
      setGuardando((prev) => { const s = new Set(prev); s.delete(alumnoEventoId); return s; });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-100 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-[#0d0d0d] font-bold text-lg">Alumnos del examen</h2>
            <p className="text-gray-500 text-sm mt-0.5">{eventoNombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 p-6">
          {cargando ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : alumnos.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-16">Sin alumnos inscritos en este examen.</p>
          ) : (
            <div className="space-y-3">
              {alumnos.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-800 text-sm truncate">{a.nombreCompleto}</p>
                    <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#003087] border border-blue-100">
                      {a.gradoActual}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={guardando.has(a.id) || a.resultado !== null}
                      onClick={() => calificar(a.id, "Aprobado")}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:cursor-not-allowed ${
                        a.resultado === "Aprobado"
                          ? "bg-green-600 border-green-600 text-white"
                          : a.resultado !== null
                          ? "bg-white border-gray-200 text-gray-300"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-300"
                      }`}
                    >
                      Aprobado
                    </button>
                    <button
                      type="button"
                      disabled={guardando.has(a.id) || a.resultado !== null}
                      onClick={() => calificar(a.id, "No aprobado")}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:cursor-not-allowed ${
                        a.resultado === "No aprobado"
                          ? "bg-red-600 border-red-600 text-white"
                          : a.resultado !== null
                          ? "bg-white border-gray-200 text-gray-300"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300"
                      }`}
                    >
                      No aprobado
                    </button>
                  </div>
                  {a.resultado !== null && (
                    <p className="text-xs text-gray-400">Resultado registrado, no se puede modificar.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-300 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
