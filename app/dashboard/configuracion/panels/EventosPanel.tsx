"use client";
import { useCallback, useEffect, useState } from "react";
import ModalAgregarEvento from "./ModalAgregarEvento";
import ModalEditarEvento from "./ModalEditarEvento";
import ModalAlumnosEvento from "./ModalAlumnosEvento";

export interface Evento {
  id: number;
  nombre: string;
  tipoEvento: string;
  fecha: string;
  hora: string | null;
  costo: number;
  estado: string | null;
  ciudad: string | null;
  ubicacion: string | null;
  descripcion: string | null;
  _count: { alumnos: number };
}

const TIPO_LABELS: Record<string, string> = {
  TORNEO:     "Torneo",
  EXAMEN:     "Examen",
  SEMINARIO:  "Seminario",
  EXHIBICION: "Exhibición",
  GRADUACION: "Graduación",
  CAMPAMENTO: "Campamento",
  OTRO:       "Otro",
};

const TIPO_COLORS: Record<string, string> = {
  TORNEO:     "bg-blue-100 text-blue-700",
  EXAMEN:     "bg-purple-100 text-purple-700",
  SEMINARIO:  "bg-teal-100 text-teal-700",
  EXHIBICION: "bg-orange-100 text-orange-700",
  GRADUACION: "bg-yellow-100 text-yellow-800",
  CAMPAMENTO: "bg-green-100 text-green-700",
  OTRO:       "bg-gray-100 text-gray-600",
};

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export default function EventosPanel() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [showAgregar, setShowAgregar] = useState(false);
  const [eventoEditar, setEventoEditar] = useState<Evento | null>(null);
  const [eventoAlumnos, setEventoAlumnos] = useState<Evento | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    const res = await fetch("/api/eventos");
    const data = await res.json();
    setEventos(Array.isArray(data) ? data : []);
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function handleCreated(nuevo: Evento) {
    setEventos((prev) => [...prev, nuevo].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    ));
    setShowAgregar(false);
  }

  function handleUpdated(actualizado: Evento) {
    setEventos((prev) =>
      prev.map((e) => e.id === actualizado.id ? actualizado : e)
         .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    );
    setEventoEditar(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-gray-800 font-bold text-lg">Eventos</h2>
          <p className="text-gray-400 text-sm mt-0.5">Torneos, exámenes y más</p>
        </div>
        <button
          onClick={() => setShowAgregar(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar evento
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {cargando ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : eventos.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-sm">No hay eventos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-100 border-b border-blue-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider hidden md:table-cell">Costo</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Alumnos</th>
                <th className="px-4 py-3.5 w-20" />
              </tr>
            </thead>
            <tbody>
              {eventos.map((ev) => (
                <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{ev.nombre}</p>
                    {(ev.ciudad || ev.estado) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[ev.ciudad, ev.estado].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TIPO_COLORS[ev.tipoEvento] ?? "bg-gray-100 text-gray-600"}`}>
                      {TIPO_LABELS[ev.tipoEvento] ?? ev.tipoEvento}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm hidden sm:table-cell">
                    {fmtFecha(ev.fecha)}
                    {ev.hora && <span className="ml-1 text-gray-400">{ev.hora}</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-700 font-medium hidden md:table-cell">
                    ${ev.costo.toLocaleString("es-MX")}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#003087]/10 text-[#003087] text-xs font-bold">
                      {ev._count.alumnos}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-3">
                      {/* Editar */}
                      <button
                        onClick={() => setEventoEditar(ev)}
                        className="text-gray-400 hover:text-[#003087] transition-colors"
                        title="Editar evento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {/* Agregar alumnos */}
                      <button
                        onClick={() => setEventoAlumnos(ev)}
                        className="text-gray-400 hover:text-[#003087] transition-colors"
                        title="Gestionar alumnos"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAgregar && (
        <ModalAgregarEvento
          onClose={() => setShowAgregar(false)}
          onCreated={handleCreated}
        />
      )}

      {eventoEditar && (
        <ModalEditarEvento
          evento={eventoEditar}
          onClose={() => setEventoEditar(null)}
          onUpdated={handleUpdated}
        />
      )}

      {eventoAlumnos && (
        <ModalAlumnosEvento
          evento={eventoAlumnos}
          onClose={() => {
            cargar(); // refrescar conteo
            setEventoAlumnos(null);
          }}
        />
      )}
    </div>
  );
}
