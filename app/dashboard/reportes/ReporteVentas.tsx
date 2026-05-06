"use client";
import { useEffect, useState } from "react";
import ModalDetalleVenta from "./ModalDetalleVenta";

type Filtro    = "todos" | "tienda" | "productos";
type Agrupado  = "venta" | "producto";

interface DetalleVenta {
  id: number;
  productoId: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  precioVenta: number;
  subtotal: number;
}

interface Venta {
  id: number;
  fecha: string;
  total: number;
  metodoPago: "EFECTIVO" | "TRANSFERENCIA";
  detalles: DetalleVenta[];
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtFechaHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  });
}

function resumenProductos(detalles: DetalleVenta[]) {
  if (detalles.length === 1) return detalles[0].nombre;
  if (detalles.length === 2) return detalles.map((d) => d.nombre).join(", ");
  return `${detalles[0].nombre} y ${detalles.length - 1} más`;
}

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todos",     label: "Todos"     },
  { value: "tienda",    label: "Tienda"    },
  { value: "productos", label: "Productos" },
];

export default function ReporteVentas() {
  const hoy = hoyISO();
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null);
  const [agrupado, setAgrupado] = useState<Agrupado>("venta");

  useEffect(() => {
    setCargando(true);
    fetch(`/api/reportes/ventas?desde=${desde}&hasta=${hasta}&filtro=${filtro}`)
      .then((r) => r.json())
      .then((d) => setVentas(Array.isArray(d) ? d : []))
      .finally(() => setCargando(false));
  }, [desde, hasta, filtro]);

  const totalVentas = ventas.reduce((s, v) => s + v.total, 0);
  const totalUnidades = ventas.reduce((s, v) => s + v.detalles.reduce((ss, d) => ss + d.cantidad, 0), 0);

  // Agrupación por producto
  const productosAgrupados = Object.values(
    ventas.flatMap((v) => v.detalles).reduce((acc, d) => {
      if (!acc[d.productoId]) {
        acc[d.productoId] = { productoId: d.productoId, nombre: d.nombre, categoria: d.categoria, cantidad: 0, total: 0 };
      }
      acc[d.productoId].cantidad += d.cantidad;
      acc[d.productoId].total   += d.subtotal;
      return acc;
    }, {} as Record<number, { productoId: number; nombre: string; categoria: string; cantidad: number; total: number }>)
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="mt-6 space-y-5">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        {/* Rango de fechas */}
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

        {/* Filtro categoría */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 gap-1">
            {FILTROS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                  filtro === f.value
                    ? "bg-white text-[#003087] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro agrupado */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Agrupado</label>
          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 gap-1">
            {([ { value: "venta", label: "Venta" }, { value: "producto", label: "Producto" } ] as { value: Agrupado; label: string }[]).map((a) => (
              <button
                key={a.value}
                onClick={() => setAgrupado(a.value)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                  agrupado === a.value
                    ? "bg-white text-[#003087] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Ventas realizadas",  value: ventas.length },
          { label: "Unidades vendidas",  value: totalUnidades },
          { label: "Total recaudado",    value: `$${totalVentas.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` },
        ].map((c) => (
          <div key={c.label} className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-[#003087]">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="border border-gray-300 rounded-2xl overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center py-16 bg-gray-200">
            <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ventas.length === 0 ? (
          <div className="bg-gray-200 px-6 py-16 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400 text-sm">Sin ventas en el período seleccionado</p>
          </div>
        ) : agrupado === "venta" ? (
          <div className="overflow-x-auto bg-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-100 border-b border-blue-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Producto(s)</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Cant.</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider hidden sm:table-cell">Método</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider hidden md:table-cell">Fecha y hora</th>
                  <th className="px-4 py-3.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-100 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">{resumenProductos(v.detalles)}</p>
                      <p className="text-xs text-gray-400">Folio #{v.id}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-gray-800">
                      {v.detalles.reduce((s, d) => s + d.cantidad, 0)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-800">
                      ${v.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        v.metodoPago === "EFECTIVO"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {v.metodoPago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell text-xs">
                      {fmtFechaHora(v.fecha)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setVentaDetalle(v)}
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
        ) : (
          <div className="overflow-x-auto bg-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-100 border-b border-blue-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Unidades</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Total recaudado</th>
                </tr>
              </thead>
              <tbody>
                {productosAgrupados.map((p) => (
                  <tr key={p.productoId} className="border-b border-gray-100 hover:bg-gray-100 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell text-xs">{p.categoria}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-gray-800">{p.cantidad}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                      ${p.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {ventaDetalle && (
        <ModalDetalleVenta
          venta={ventaDetalle}
          onClose={() => setVentaDetalle(null)}
        />
      )}
    </div>
  );
}
