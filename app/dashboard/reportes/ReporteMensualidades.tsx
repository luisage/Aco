"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

type Periodo = "mensual" | "semanal";

interface PeriodoData {
  periodo: string;
  label: string;
  total: number;
  cantidad: number;
}

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "mensual",  label: "Mensual"  },
  { value: "semanal",  label: "Semanal"  },
];

export default function ReporteMensualidades() {
  const [periodo, setPeriodo] = useState<Periodo>("mensual");
  const [data, setData]       = useState<PeriodoData[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setCargando(true);
    fetch(`/api/reportes/mensualidades?periodo=${periodo}`)
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .finally(() => setCargando(false));
  }, [periodo]);

  const totalGeneral = data.reduce((s, d) => s + d.total, 0);
  const totalPagos   = data.reduce((s, d) => s + d.cantidad, 0);

  return (
    <div className="mt-6 space-y-5">
      {/* Filtro período */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Período</label>
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
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total recaudado",    value: `$${totalGeneral.toLocaleString("es-MX")}` },
          { label: "Pagos registrados",  value: totalPagos },
        ].map((c) => (
          <div key={c.label} className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-[#003087]">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfica de línea */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${Number(v).toLocaleString("es-MX")}`}
                width={72}
              />
              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString("es-MX")}`,
                  "Total recaudado",
                ]}
                labelStyle={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#003087"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#003087", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#D4A017", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
