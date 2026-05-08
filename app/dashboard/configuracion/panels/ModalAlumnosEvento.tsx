"use client";
import { useCallback, useEffect, useState } from "react";
import type { Evento } from "./EventosPanel";
import ModalPagoEvento from "./ModalPagoEvento";

interface AlumnoInscrito {
  id: number;
  alumnoId: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  pagado: boolean;
  totalPagado: number;
}

interface AlumnoBusqueda {
  id: number;
  nombre: string;
  apellido: string;
}

interface Props {
  evento: Evento;
  onClose: () => void;
}

export default function ModalAlumnosEvento({ evento, onClose }: Props) {
  const [inscritos, setInscritos]   = useState<AlumnoInscrito[]>([]);
  const [busqueda, setBusqueda]     = useState("");
  const [resultados, setResultados] = useState<AlumnoBusqueda[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [agregando, setAgregando]   = useState<number | null>(null);
  const [quitando, setQuitando]     = useState<number | null>(null);
  const [pagoAlumno, setPagoAlumno] = useState<AlumnoInscrito | null>(null);

  const cargarInscritos = useCallback(async () => {
    setCargando(true);
    const res  = await fetch(`/api/eventos/${evento.id}/alumnos`);
    const data = await res.json();
    setInscritos(Array.isArray(data) ? data : []);
    setCargando(false);
  }, [evento.id]);

  useEffect(() => { cargarInscritos(); }, [cargarInscritos]);

  // Búsqueda con debounce
  useEffect(() => {
    const q = busqueda.trim();
    if (!q) { setResultados([]); return; }
    const timer = setTimeout(async () => {
      const res  = await fetch(`/api/alumnos?q=${encodeURIComponent(q)}&estado=ACTIVO`);
      const data = await res.json();
      setResultados(Array.isArray(data) ? data : []);
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const inscritosIds = new Set(inscritos.map((i) => i.alumnoId));

  async function agregar(alumno: AlumnoBusqueda) {
    setAgregando(alumno.id);
    try {
      const res = await fetch(`/api/eventos/${evento.id}/alumnos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alumnoId: alumno.id }),
      });
      if (res.ok) {
        await cargarInscritos();
      }
    } finally {
      setAgregando(null);
    }
  }

  async function quitar(inscritoId: number, alumnoId: number) {
    setQuitando(inscritoId);
    try {
      await fetch(`/api/eventos/${evento.id}/alumnos?alumnoId=${alumnoId}`, {
        method: "DELETE",
      });
      setInscritos((prev) => prev.filter((i) => i.id !== inscritoId));
    } finally {
      setQuitando(null);
    }
  }

  function badgePago(alumno: AlumnoInscrito) {
    if (alumno.pagado)
      return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Pagado</span>;
    if (alumno.totalPagado > 0)
      return <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">Parcial</span>;
    return <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Pendiente</span>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-[#0d0d0d] font-bold text-lg">Alumnos del evento</h2>
            <p className="text-gray-500 text-xs mt-0.5">{evento.nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

          {/* Buscador */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar alumno activo</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre o apellido..."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50"
            />

            {resultados.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {resultados.map((a) => {
                  const yaInscrito = inscritosIds.has(a.id);
                  return (
                    <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-gray-800">{a.nombre} {a.apellido}</span>
                      {yaInscrito ? (
                        <span className="text-xs text-green-600 font-semibold">Ya inscrito</span>
                      ) : (
                        <button
                          onClick={() => agregar(a)}
                          disabled={agregando === a.id}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#003087] hover:bg-[#002060] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {agregando === a.id ? (
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                          Agregar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {busqueda.trim() && resultados.length === 0 && (
              <p className="mt-2 text-xs text-gray-400 text-center py-2">Sin resultados</p>
            )}
          </div>

          <div className="border-t border-gray-300" />

          {/* Alumnos inscritos */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Alumnos inscritos
              <span className="ml-2 text-xs font-normal text-gray-400">({inscritos.length})</span>
            </p>

            {cargando ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : inscritos.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-400 text-sm">Sin alumnos inscritos</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {inscritos.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">{i.nombre} {i.apellido}</span>
                    {badgePago(i)}
                    {/* Botón pago */}
                    <button
                      onClick={() => setPagoAlumno(i)}
                      className="text-gray-400 hover:text-[#003087] transition-colors flex-shrink-0"
                      title="Gestionar pago"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    {/* Botón quitar */}
                    <button
                      onClick={() => quitar(i.id, i.alumnoId)}
                      disabled={quitando === i.id}
                      className="text-gray-400 hover:text-[#C8102E] transition-colors disabled:opacity-40 flex-shrink-0"
                      title="Quitar del evento"
                    >
                      {quitando === i.id ? (
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-5 pt-1 flex-shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium transition-colors">
            Cerrar
          </button>
        </div>
      </div>

      {pagoAlumno && (
        <ModalPagoEvento
          evento={evento}
          alumnoId={pagoAlumno.alumnoId}
          nombreAlumno={`${pagoAlumno.nombre} ${pagoAlumno.apellido}`}
          telefono={pagoAlumno.telefono}
          onClose={() => setPagoAlumno(null)}
          onPagado={() => {
            setInscritos((prev) =>
              prev.map((i) => i.id === pagoAlumno.id ? { ...i, pagado: true } : i)
            );
            setPagoAlumno(null);
          }}
        />
      )}
    </div>
  );
}
