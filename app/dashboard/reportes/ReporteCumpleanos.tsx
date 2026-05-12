"use client";
import { useEffect, useState } from "react";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  dia: number;
  edad: number;
}

export default function ReporteCumpleanos() {
  const mesActual = new Date().getMonth() + 1; // 1-12
  const [mes, setMes] = useState(mesActual);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setCargando(true);
    fetch(`/api/reportes/cumpleanos?mes=${mes}`)
      .then((r) => r.json())
      .then((data) => setAlumnos(Array.isArray(data) ? data : []))
      .catch(() => setAlumnos([]))
      .finally(() => setCargando(false));
  }, [mes]);

  return (
    <div className="mt-8 space-y-5">
      {/* Filtro mes */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Mes</label>
        <select
          value={mes}
          onChange={(e) => setMes(parseInt(e.target.value))}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 w-full sm:w-52 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "16px",
          }}
        >
          {MESES.map((nombre, i) => (
            <option key={i + 1} value={i + 1}>{nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Header tabla */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-50">
          <div>
            <h3 className="font-bold text-gray-800 text-base">
              Cumpleaños — {MESES[mes - 1]}
            </h3>
            {!cargando && (
              <p className="text-gray-400 text-xs mt-0.5">
                {alumnos.length} {alumnos.length === 1 ? "alumno" : "alumnos"}
              </p>
            )}
          </div>
          {/* Ícono pastel */}
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M8 7V5m4 2V5m4 2V5" />
            </svg>
          </div>
        </div>

        {cargando ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : alumnos.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-sm">
              No hay alumnos activos con cumpleaños en {MESES[mes - 1]}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Apellido</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Día</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Edad que cumple</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((a, idx) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 text-gray-400 text-sm">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">{a.nombre}</td>
                    <td className="px-4 py-3.5 text-gray-700">{a.apellido}</td>
                    <td className="px-4 py-3.5 text-center text-gray-600 hidden sm:table-cell">
                      {a.dia}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-pink-100 text-pink-700 text-sm font-bold">
                        {a.edad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
