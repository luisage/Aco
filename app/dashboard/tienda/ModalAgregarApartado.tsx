"use client";
import { useRef, useState } from "react";
import type { Apartado } from "./ApartadosClient";

interface Producto {
  id: number;
  nombre: string;
  costo: number;
  cantidad: number;
  categoria: string;
}

interface ItemSeleccionado {
  producto: Producto;
  cantidad: number;
}

interface AlumnoBusqueda {
  id: number;
  nombre: string;
  apellido: string;
}

interface Props {
  onClose: () => void;
  onCreated: (a: Apartado) => void;
}

export default function ModalAgregarApartado({ onClose, onCreated }: Props) {
  const [buscadorProducto, setBuscadorProducto] = useState("");
  const [sugerenciasProducto, setSugerenciasProducto] = useState<Producto[]>([]);
  const [seleccionados, setSeleccionados] = useState<ItemSeleccionado[]>([]);

  const [buscadorAlumno, setBuscadorAlumno] = useState("");
  const [sugerenciasAlumno, setSugerenciasAlumno] = useState<AlumnoBusqueda[]>([]);
  const [alumno, setAlumno] = useState<AlumnoBusqueda | null>(null);

  const [montoAbono, setMontoAbono] = useState("");
  const [metodoAbono, setMetodoAbono] = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debounceProducto = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function buscarProductos(texto: string) {
    setBuscadorProducto(texto);
    clearTimeout(debounceProducto.current);
    const q = texto.trim();
    if (!q) { setSugerenciasProducto([]); return; }
    debounceProducto.current = setTimeout(() => {
      fetch(`/api/productos/buscar?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setSugerenciasProducto(data); })
        .catch(() => {});
    }, 250);
  }

  const debounceAlumno = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function buscarAlumnos(texto: string) {
    setBuscadorAlumno(texto);
    clearTimeout(debounceAlumno.current);
    const q = texto.trim();
    if (!q) { setSugerenciasAlumno([]); return; }
    debounceAlumno.current = setTimeout(() => {
      fetch(`/api/alumnos?q=${encodeURIComponent(q)}&estado=ACTIVO`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setSugerenciasAlumno(data); })
        .catch(() => {});
    }, 250);
  }

  function agregarProducto(p: Producto) {
    setSeleccionados((prev) => {
      const existe = prev.find((i) => i.producto.id === p.id);
      if (existe) return prev.map((i) => i.producto.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto: p, cantidad: 1 }];
    });
    setBuscadorProducto("");
    setSugerenciasProducto([]);
  }

  function cambiarCantidad(id: number, delta: number) {
    setSeleccionados((prev) =>
      prev.map((i) => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)
    );
  }

  function quitarProducto(id: number) {
    setSeleccionados((prev) => prev.filter((i) => i.producto.id !== id));
  }

  const total = seleccionados.reduce((s, i) => s + i.producto.costo * i.cantidad, 0);
  const montoAbonoNum = parseFloat(montoAbono) || 0;

  async function handleGuardar() {
    setError("");
    if (!alumno) { setError("Selecciona un alumno."); return; }
    if (seleccionados.length === 0) { setError("Agrega al menos un producto."); return; }
    if (montoAbonoNum > total) { setError("El abono no puede ser mayor al total."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/apartados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumnoId: alumno.id,
          productos: seleccionados.map((i) => ({
            productoId: i.producto.id,
            cantidad: i.cantidad,
            precioUnitario: i.producto.costo,
          })),
          abonoInicial: montoAbonoNum > 0 ? { monto: montoAbonoNum, metodoPago: metodoAbono } : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al guardar. Intenta de nuevo.");
        return;
      }
      const nuevo = await res.json();
      onCreated(nuevo);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl flex-shrink-0">
          <h2 className="text-[#0d0d0d] font-bold text-lg">Nuevo apartado</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 space-y-5 flex-1">
          {/* Buscador de productos */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Productos <span className="text-[#C8102E]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={buscadorProducto}
                onChange={(e) => buscarProductos(e.target.value)}
                placeholder="Buscar por nombre o ID..."
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
              />
              {sugerenciasProducto.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {sugerenciasProducto.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => agregarProducto(p)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors text-left"
                    >
                      <div>
                        <span className="font-medium text-gray-800">{p.nombre}</span>
                        <span className="ml-2 text-xs text-gray-400">{p.categoria}</span>
                      </div>
                      <span className="text-gray-600 font-semibold ml-4 flex-shrink-0">
                        ${p.costo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabla de productos seleccionados */}
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
              <p className="text-xs font-semibold text-[#003087] uppercase tracking-wider">
                Productos seleccionados {seleccionados.length > 0 && `(${seleccionados.length})`}
              </p>
            </div>
            {seleccionados.length === 0 ? (
              <div className="bg-white px-4 py-8 text-center">
                <p className="text-gray-400 text-sm">Sin productos agregados</p>
              </div>
            ) : (
              <div className="bg-white divide-y divide-gray-100">
                {seleccionados.map(({ producto, cantidad }) => (
                  <div key={producto.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => quitarProducto(producto.id)}
                      className="text-gray-400 hover:text-[#C8102E] transition-colors flex-shrink-0"
                      title="Quitar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{producto.nombre}</p>
                      <p className="text-xs text-gray-500">
                        ${producto.costo.toLocaleString("es-MX", { minimumFractionDigits: 2 })} c/u
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => cambiarCantidad(producto.id, -1)}
                        className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-base font-bold leading-none transition-colors"
                      >−</button>
                      <span className="w-5 text-center text-sm font-semibold text-gray-800">{cantidad}</span>
                      <button
                        onClick={() => cambiarCantidad(producto.id, 1)}
                        className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-base font-bold leading-none transition-colors"
                      >+</button>
                    </div>
                    <p className="w-20 text-right text-sm font-semibold text-gray-800 flex-shrink-0">
                      ${(producto.costo * cantidad).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {seleccionados.length > 0 && (
              <div className="bg-blue-50 border-t border-blue-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-lg font-bold text-[#003087]">
                  ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-300" />

          {/* Buscador de alumno */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Alumno <span className="text-[#C8102E]">*</span>
            </label>
            {alumno ? (
              <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-2.5">
                <span className="text-sm font-medium text-gray-800">{alumno.nombre} {alumno.apellido}</span>
                <button
                  onClick={() => { setAlumno(null); setBuscadorAlumno(""); }}
                  className="text-gray-400 hover:text-[#C8102E] transition-colors text-xs font-semibold"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={buscadorAlumno}
                  onChange={(e) => buscarAlumnos(e.target.value)}
                  placeholder="Buscar por nombre o apellido..."
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
                />
                {sugerenciasAlumno.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {sugerenciasAlumno.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setAlumno(a); setSugerenciasAlumno([]); }}
                        className="w-full flex items-center px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors text-left"
                      >
                        <span className="font-medium text-gray-800">{a.nombre} {a.apellido}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Abono inicial */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Abono inicial <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                max={total || undefined}
                step="0.01"
                value={montoAbono}
                onChange={(e) => setMontoAbono(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
              />
              <select
                value={metodoAbono}
                onChange={(e) => setMetodoAbono(e.target.value as "EFECTIVO" | "TRANSFERENCIA")}
                className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-[#C8102E] text-sm bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-1 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
