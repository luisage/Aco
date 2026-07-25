"use client";
import { useState } from "react";
import ReporteAsistencia from "./ReporteAsistencia";
import ReporteMensualidades from "./ReporteMensualidades";
import ReporteVentas from "./ReporteVentas";
import ReporteCumpleanos from "./ReporteCumpleanos";
import ReporteExamenes from "./ReporteExamenes";

type TipoReporte = "" | "asistencia" | "ingreso-mensual" | "ventas" | "cumpleanos" | "examenes";

const TIPOS: { value: TipoReporte; label: string }[] = [
  { value: "asistencia",      label: "Asistencia"          },
  { value: "ingreso-mensual", label: "Ingreso mensualidad"  },
  { value: "ventas",          label: "Ventas"               },
  { value: "cumpleanos",      label: "Cumpleaños"           },
  { value: "examenes",        label: "Exámenes"             },
];

export default function ReportesPage() {
  const [tipo, setTipo] = useState<TipoReporte>("");

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Reportes</h1>
      <p className="text-gray-500 text-sm mb-8">Estadísticas y reportes de la escuela</p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {/* Selector de tipo */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Tipo de reporte
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoReporte)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 w-full sm:w-64 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "16px",
            }}
          >
            <option value="">Selecciona el reporte</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Contenido del reporte */}
        {!tipo && (
          <div className="mt-10 flex flex-col items-center justify-center text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-sm">Selecciona un tipo de reporte para continuar.</p>
          </div>
        )}

        {tipo === "asistencia"      && <ReporteAsistencia />}
        {tipo === "ingreso-mensual" && <ReporteMensualidades />}
        {tipo === "ventas"          && <ReporteVentas />}
        {tipo === "cumpleanos"      && <ReporteCumpleanos />}
        {tipo === "examenes"        && <ReporteExamenes />}
      </div>
    </div>
  );
}
