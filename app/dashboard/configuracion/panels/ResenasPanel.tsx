"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { cambiarEstadoResena } from "@/app/actions/resenas";

type EstadoResena = "PENDIENTE" | "VISIBLE" | "OCULTA";

interface Resena {
  id: number;
  calificacion: number;
  comentario: string;
  estado: EstadoResena;
  fecha: string;
  creadoEn: string;
}

const BADGE: Record<EstadoResena, { cls: string; dot: string; label: string }> = {
  PENDIENTE: { cls: "bg-amber-100 text-amber-700 border-amber-300", dot: "bg-amber-500", label: "Pendiente" },
  VISIBLE:   { cls: "bg-green-100 text-green-700 border-green-300",  dot: "bg-green-500",  label: "Visible"   },
  OCULTA:    { cls: "bg-gray-100 text-gray-400 border-gray-200",     dot: "bg-gray-400",   label: "Oculta"    },
};

const ESTADOS: EstadoResena[] = ["PENDIENTE", "VISIBLE", "OCULTA"];

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-base ${i <= n ? "text-[#D4A017]" : "text-gray-300"}`}>★</span>
      ))}
    </span>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ResenasPanel() {
  const [filtro, setFiltro] = useState<EstadoResena>("PENDIENTE");
  const [datos, setDatos] = useState<Resena[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estadoAbierto, setEstadoAbierto] = useState<number | null>(null);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchDatos = useCallback(async (estado: EstadoResena) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/resenas?estado=${estado}`);
      const json = await res.json();
      setDatos(json);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchDatos(filtro); }, [filtro, fetchDatos]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEstadoAbierto(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleCambiarEstado(id: number, nuevoEstado: EstadoResena) {
    setEstadoAbierto(null);
    setActualizandoId(id);
    try {
      await cambiarEstadoResena(id, nuevoEstado);
      if (nuevoEstado !== filtro) {
        setDatos((prev) => prev.filter((r) => r.id !== id));
      } else {
        setDatos((prev) => prev.map((r) => r.id === id ? { ...r, estado: nuevoEstado } : r));
      }
    } finally {
      setActualizandoId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-blue-100 border-b border-blue-200">
        <div>
          <h2 className="text-[#0d0d0d] font-bold text-lg">Reseñas</h2>
          <p className="text-gray-500 text-sm mt-0.5">Administra las reseñas enviadas desde el inicio</p>
        </div>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoResena)}
          className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer appearance-none pr-8 min-w-[140px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "16px",
          }}
        >
          <option value="PENDIENTE">Pendiente</option>
          <option value="VISIBLE">Visible</option>
          <option value="OCULTA">Oculta</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Calificación</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Comentario</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Fecha</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No hay reseñas con estado {BADGE[filtro].label.toLowerCase()}.
                </td>
              </tr>
            ) : (
              datos.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Stars n={r.calificacion} />
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-[300px]">
                    <span className="line-clamp-2">{r.comentario}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm hidden sm:table-cell whitespace-nowrap">
                    {fmt(r.creadoEn)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative" ref={estadoAbierto === r.id ? dropdownRef : null}>
                      <button
                        onClick={() => setEstadoAbierto(estadoAbierto === r.id ? null : r.id)}
                        disabled={actualizandoId === r.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors disabled:opacity-50 ${BADGE[r.estado].cls}`}
                      >
                        {actualizandoId === r.id ? (
                          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${BADGE[r.estado].dot}`} />
                        )}
                        {BADGE[r.estado].label}
                        <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {estadoAbierto === r.id && (
                        <div className="absolute left-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-36 py-1 overflow-hidden">
                          {ESTADOS.map((e) => (
                            <button
                              key={e}
                              onClick={() => handleCambiarEstado(r.id, e)}
                              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                                e === r.estado
                                  ? "bg-gray-100 font-semibold text-gray-800"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${BADGE[e].dot}`} />
                              {BADGE[e].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
