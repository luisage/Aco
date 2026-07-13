"use client";
import { useCallback, useEffect, useState } from "react";
import type { Apartado } from "./ApartadosClient";

interface DetalleProducto {
  id: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface AbonoHistorial {
  id: number;
  monto: number;
  metodoPago: "EFECTIVO" | "TRANSFERENCIA";
  fechaPago: string;
  notas: string | null;
}

interface DetalleApartadoData {
  id: number;
  alumno: { nombre: string; apellido: string; telefono: string | null };
  fechaApartado: string;
  fechaLiquidacion: string | null;
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO";
  total: number;
  totalAbonado: number;
  falta: number;
  detalles: DetalleProducto[];
  abonos: AbonoHistorial[];
}

interface Props {
  apartadoId: number;
  onClose: () => void;
  onChanged: (a: Apartado) => void;
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export default function ModalDetalleApartado({ apartadoId, onClose, onChanged }: Props) {
  const [data, setData] = useState<DetalleApartadoData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    const res = await fetch(`/api/apartados/${apartadoId}`);
    const d = await res.json();
    setData(d);
    setCargando(false);
    return d as DetalleApartadoData;
  }, [apartadoId]);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleAbono(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0) { setError("Ingresa un monto válido."); return; }
    if (data && montoNum > data.falta) {
      setError(`El monto no puede ser mayor al saldo pendiente ($${data.falta.toLocaleString("es-MX", { minimumFractionDigits: 2 })}).`);
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`/api/apartados/${apartadoId}/abonos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto: montoNum, metodoPago: metodo, notas }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Error al registrar. Intenta de nuevo.");
        return;
      }
      setMonto("");
      setNotas("");
      const actualizado = await cargar();
      onChanged({
        id: actualizado.id,
        alumnoNombre: `${actualizado.alumno.nombre} ${actualizado.alumno.apellido}`,
        fechaApartado: actualizado.fechaApartado,
        total: actualizado.total,
        totalAbonado: actualizado.totalAbonado,
        estado: actualizado.estado,
      });
    } catch {
      setError("Error al registrar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const porcentaje = data ? Math.min(100, Math.round((data.totalAbonado / data.total) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-[#0d0d0d] font-bold text-lg">Detalle de apartado</h2>
            {data && <p className="text-gray-500 text-xs mt-0.5">{data.alumno.nombre} {data.alumno.apellido}</p>}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {cargando ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data ? (
            <>
              {/* Resumen */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fecha de registro</span>
                  <span className="font-medium text-gray-800">{fmtFecha(data.fechaApartado)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-800">${data.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total abonado</span>
                  <span className="font-semibold text-green-700">${data.totalAbonado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Saldo pendiente</span>
                  <span className={`font-bold ${data.falta > 0 ? "text-orange-600" : "text-green-600"}`}>
                    ${data.falta.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${data.estado === "COMPLETADO" ? "bg-green-500" : "bg-[#D4A017]"}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">{porcentaje}% pagado</p>
                </div>

                {data.estado === "COMPLETADO" && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 text-sm font-semibold">Pago completado — producto entregado</span>
                  </div>
                )}
              </div>

              {/* Productos */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                  <p className="text-xs font-semibold text-[#003087] uppercase tracking-wider">
                    Productos ({data.detalles.length})
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-100 border-b border-blue-200">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Producto</th>
                        <th className="text-center px-3 py-2.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Cant.</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.detalles.map((d) => (
                        <tr key={d.id} className="bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{d.nombre}</p>
                            <p className="text-xs text-gray-400">
                              ${d.precioUnitario.toLocaleString("es-MX", { minimumFractionDigits: 2 })} c/u
                            </p>
                          </td>
                          <td className="px-3 py-3 text-center font-semibold text-gray-800">{d.cantidad}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
                            ${d.subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formulario de abono */}
              {data.estado === "PENDIENTE" && (
                <form onSubmit={handleAbono} className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Registrar abono</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Monto ($) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min={1}
                        max={data.falta}
                        step="0.01"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder={`Máx. $${data.falta.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Método</label>
                      <select
                        value={metodo}
                        onChange={(e) => setMetodo(e.target.value as "EFECTIVO" | "TRANSFERENCIA")}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "14px" }}
                      >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Notas <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <input
                      type="text"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      maxLength={200}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50"
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={guardando}
                    className="w-full py-2.5 rounded-xl bg-[#003087] hover:bg-[#002060] text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {guardando && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {guardando ? "Registrando..." : "Registrar abono"}
                  </button>
                </form>
              )}

              {/* Historial de abonos */}
              {data.abonos.length > 0 && (
                <div>
                  <div className="border-t border-gray-300 mb-4" />
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Historial de abonos
                    <span className="ml-2 text-xs font-normal text-gray-400">({data.abonos.length})</span>
                  </p>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {data.abonos.map((a) => (
                      <div key={a.id} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800">${a.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmtFecha(a.fechaPago)} · {a.metodoPago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                            {a.notas && ` · ${a.notas}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-400 text-sm py-8">No se pudo cargar la información.</p>
          )}
        </div>

        <div className="px-6 pb-5 pt-1 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
