"use client";
import { useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

type Periodo = "semana" | "mes";

interface Punto { fecha: string; label: string; total: number }
interface AlumnoSugerido { id: number; nombre: string; apellido: string; telefono: string | null }

function formatFechaDDMMYYYY(fechaIso: string): string {
  const [year, month, day] = fechaIso.split("-");
  return `${day}-${month}-${year}`;
}

function telefonoWhatsApp(telefono: string): string {
  const digits = telefono.replace(/\D/g, "");
  return digits.length === 10 ? `52${digits}` : digits;
}

const PERIODOS: { value: Periodo; label: string; dias: number }[] = [
  { value: "semana", label: "Semana", dias: 7  },
  { value: "mes",    label: "Mes",    dias: 30 },
];

export default function ReporteAsistencia() {
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [datos, setDatos] = useState<Punto[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtro de alumno
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<AlumnoSugerido[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [alumnoSel, setAlumnoSel] = useState<AlumnoSugerido | null>(null);
  const cajaRef = useRef<HTMLDivElement>(null);

  // Cerrar la lista de sugerencias al hacer click fuera
  useEffect(() => {
    function cerrar(e: MouseEvent) {
      if (cajaRef.current && !cajaRef.current.contains(e.target as Node)) {
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  // Autocompletado de alumnos activos
  useEffect(() => {
    if (alumnoSel || !busqueda.trim()) {
      setSugerencias([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/alumnos/buscar?q=${encodeURIComponent(busqueda.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          setSugerencias(Array.isArray(d) ? d : []);
          setMostrarSugerencias(true);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda, alumnoSel]);

  function seleccionarAlumno(a: AlumnoSugerido) {
    setAlumnoSel(a);
    setBusqueda(`${a.nombre} ${a.apellido}`);
    setSugerencias([]);
    setMostrarSugerencias(false);
  }

  function limpiarAlumno() {
    setAlumnoSel(null);
    setBusqueda("");
    setSugerencias([]);
  }

  // Datos de la gráfica
  useEffect(() => {
    const dias = PERIODOS.find((p) => p.value === periodo)!.dias;
    setCargando(true);
    const params = new URLSearchParams({ dias: String(dias) });
    if (alumnoSel) params.set("alumnoId", String(alumnoSel.id));
    fetch(`/api/reportes/asistencia?${params}`)
      .then((r) => r.json())
      .then((d) => setDatos(Array.isArray(d) ? d : []))
      .finally(() => setCargando(false));
  }, [periodo, alumnoSel]);

  const total  = datos.reduce((s, d) => s + d.total, 0);
  const maximo = Math.max(...datos.map((d) => d.total), 1);
  const promedio = datos.length ? Math.round(total / datos.length) : 0;
  const porcentaje = datos.length ? Math.round((total / datos.length) * 100) : 0;

  function enviarWhatsapp() {
    if (!alumnoSel?.telefono) return;
    const nombreCompleto = `${alumnoSel.nombre} ${alumnoSel.apellido}`;
    const periodoLabel = periodo === "semana" ? "los últimos 7 días" : "los últimos 30 días";
    const diasAsistidos = datos.filter((d) => d.total === 1).map((d) => d.label);
    const rango = datos.length
      ? `${formatFechaDDMMYYYY(datos[0].fecha)} - ${formatFechaDDMMYYYY(datos[datos.length - 1].fecha)}`
      : "";

    let mensaje = `Hola ${nombreCompleto}, este es tu reporte de asistencia de ${periodoLabel} (${rango}):\n\n`;
    mensaje += diasAsistidos.length > 0
      ? diasAsistidos.map((d) => `✅ ${d}`).join("\n")
      : "No se registró asistencia en este periodo.";

    const url = `https://wa.me/${telefonoWhatsApp(alumnoSel.telefono)}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  }

  const tarjetas = alumnoSel
    ? [
        { label: "Días asistidos",   value: total },
        { label: "% Asistencia",     value: `${porcentaje}%` },
        { label: "Días del periodo", value: datos.length },
      ]
    : [
        { label: "Total asistencias", value: total },
        { label: "Promedio por día",  value: promedio },
        { label: "Días con más asistencia", value: maximo },
      ];

  return (
    <div className="mt-6 space-y-5">
      {/* Encabezado + filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-800">Asistencia de alumnos</h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Buscador de alumno + WhatsApp */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64" ref={cajaRef}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setAlumnoSel(null); }}
              onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
              placeholder="Buscar alumno…"
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl pl-9 pr-8 py-2.5 w-full focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
            />
            {busqueda && (
              <button
                onClick={limpiarAlumno}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-56 overflow-y-auto">
                {sugerencias.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => seleccionarAlumno(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {s.nombre} {s.apellido}
                  </button>
                ))}
              </div>
            )}

            {mostrarSugerencias && busqueda.trim() && sugerencias.length === 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm text-gray-400">
                Sin alumnos activos que coincidan.
              </div>
            )}
          </div>

          {alumnoSel && (
            <button
              onClick={enviarWhatsapp}
              disabled={!alumnoSel.telefono}
              title={alumnoSel.telefono ? "Enviar reporte de asistencia por WhatsApp" : "Alumno sin teléfono registrado"}
              className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-[#25D366] text-white hover:bg-[#1ebe5a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#25D366]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.401L2 22l4.735-1.556A9.953 9.953 0 0012.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.2a8.17 8.17 0 01-4.166-1.14l-.299-.177-3.11 1.023 1.04-3.04-.194-.31A8.174 8.174 0 013.8 12c0-4.522 3.679-8.2 8.201-8.2 4.521 0 8.2 3.678 8.2 8.2 0 4.522-3.679 8.2-8.2 8.2z" />
              </svg>
            </button>
          )}
          </div>

          {/* Toggle periodo */}
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
      </div>

      {alumnoSel && (
        <p className="text-sm text-gray-500">
          Mostrando asistencia de <span className="font-semibold text-gray-700">{alumnoSel.nombre} {alumnoSel.apellido}</span>.
        </p>
      )}

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tarjetas.map((c) => (
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
                {...(alumnoSel
                  ? { domain: [0, 1] as [number, number], ticks: [0, 1], tickFormatter: (v: number) => (v === 1 ? "Sí" : "No") }
                  : {})}
              />
              <Tooltip
                cursor={{ fill: "#f3f4f6" }}
                contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: 13 }}
                formatter={(v) => alumnoSel ? [v === 1 ? "Asistió" : "No asistió", ""] : [v, "Alumnos"]}
                labelFormatter={(l) => l}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {datos.map((entry) => (
                  <Cell
                    key={entry.fecha}
                    fill={
                      alumnoSel
                        ? (entry.total === 1 ? "#22c55e" : "#e5e7eb")
                        : (entry.total === maximo && maximo > 0 ? "#003087" : "#93c5fd")
                    }
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
