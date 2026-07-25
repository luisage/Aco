"use client";
import { useEffect, useState } from "react";
import ModalDetalleExamen from "./ModalDetalleExamen";

interface Examen {
  id: number;
  nombre: string;
  fecha: string;
  totalAlumnos: number;
}

function isoHaceDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ReporteExamenes() {
  const [desde, setDesde] = useState(isoHaceDias(30));
  const [hasta, setHasta] = useState(hoyISO());
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [examenDetalle, setExamenDetalle] = useState<Examen | null>(null);

  useEffect(() => {
    setCargando(true);
    fetch(`/api/reportes/examenes?desde=${desde}&hasta=${hasta}`)
      .then((r) => r.json())
      .then((d) => setExamenes(Array.isArray(d) ? d : []))
      .finally(() => setCargando(false));
  }, [desde, hasta]);

  return (
    <div className="mt-6 space-y-5">
      {/* Filtro de rango de fechas */}
      <div className="flex items-center gap-2 flex-wrap">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            max={hasta}
            onChange={(e) => setDesde(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            min={desde}
            onChange={(e) => setHasta(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="border border-gray-300 rounded-2xl overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center py-16 bg-gray-200">
            <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : examenes.length === 0 ? (
          <div className="bg-gray-200 px-6 py-16 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-sm">Sin exámenes en el período seleccionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-100 border-b border-blue-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Fecha</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Alumnos</th>
                  <th className="px-4 py-3.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {examenes.map((ex) => (
                  <tr key={ex.id} className="border-b border-gray-100 hover:bg-gray-100 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{ex.nombre}</td>
                    <td className="px-4 py-3.5 text-gray-600">{formatFecha(ex.fecha)}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-gray-800">{ex.totalAlumnos}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setExamenDetalle(ex)}
                        className="text-gray-400 hover:text-[#003087] transition-colors"
                        title="Ver detalle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {examenDetalle && (
        <ModalDetalleExamen
          eventoId={examenDetalle.id}
          eventoNombre={examenDetalle.nombre}
          onClose={() => setExamenDetalle(null)}
        />
      )}
    </div>
  );
}
