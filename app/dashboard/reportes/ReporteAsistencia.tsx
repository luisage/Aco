"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

type Periodo = "semana" | "mes";

interface Punto { fecha: string; label: string; total: number }

const PERIODOS: { value: Periodo; label: string; dias: number }[] = [
  { value: "semana", label: "Semana", dias: 7  },
  { value: "mes",    label: "Mes",    dias: 30 },
];

export default function ReporteAsistencia() {
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [datos, setDatos] = useState<Punto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const dias = PERIODOS.find((p) => p.value === periodo)!.dias;
    setCargando(true);
    fetch(`/api/reportes/asistencia?dias=${dias}`)
      .then((r) => r.json())
      .then((d) => setDatos(Array.isArray(d) ? d : []))
      .finally(() => setCargando(false));
  }, [periodo]);

  const total  = datos.reduce((s, d) => s + d.total, 0);
  const maximo = Math.max(...datos.map((d) => d.total), 1);
  const promedio = datos.length ? Math.round(total / datos.length) : 0;

  return (
    <div className="mt-6 space-y-5">
      {/* Encabezado + toggle periodo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-800">Asistencia de alumnos</h2>
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 gap-1">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                periodo === p.value
                  ? "bg-white text-[#003087] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total asistencias", value: total },
          { label: "Promedio por día",  value: promedio },
          { label: "Días con más asistencia", value: maximo },
        ].map((c) => (
          <div key={c.label} className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-[#003087]">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfica */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        {cargando ? (
          <div className="flex justify-center items-center h-56">
            <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datos} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                interval={periodo === "mes" ? 4 : 0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#f3f4f6" }}
                contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: 13 }}
                formatter={(v: number | string) => [v, "Alumnos"]}
                labelFormatter={(l) => l}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {datos.map((entry) => (
                  <Cell
                    key={entry.fecha}
                    fill={entry.total === maximo && maximo > 0 ? "#003087" : "#93c5fd"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
