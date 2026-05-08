"use client";
import { useEffect, useState } from "react";
import type { Evento } from "./EventosPanel";

interface HistorialPago {
  id: number;
  monto: number;
  metodoPago: "EFECTIVO" | "TRANSFERENCIA";
  fechaPago: string;
  notas: string | null;
  registradoPor: string | null;
}

interface ResumenPago {
  alumnoEventoId: number;
  costo: number;
  totalPagado: number;
  falta: number;
  pagado: boolean;
  historial: HistorialPago[];
}

interface Props {
  evento: Evento;
  alumnoId: number;
  nombreAlumno: string;
  onClose: () => void;
  onPagado: () => void;
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export default function ModalPagoEvento({ evento, alumnoId, nombreAlumno, onClose, onPagado }: Props) {
  const [resumen, setResumen]       = useState<ResumenPago | null>(null);
  const [cargando, setCargando]     = useState(true);
  const [monto, setMonto]           = useState("");
  const [metodo, setMetodo]         = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");
  const [notas, setNotas]           = useState("");
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState("");

  async function cargar() {
    setCargando(true);
    const res  = await fetch(`/api/eventos/${evento.id}/alumnos/${alumnoId}/pagos`);
    const data = await res.json();
    setResumen(data);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function handlePago(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const montoNum = parseInt(monto);
    if (!montoNum || montoNum <= 0) { setError("Ingresa un monto válido."); return; }
    if (resumen && montoNum > resumen.falta) {
      setError(`El monto no puede ser mayor al saldo pendiente ($${resumen.falta.toLocaleString("es-MX")}).`);
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`/api/eventos/${evento.id}/alumnos/${alumnoId}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto: montoNum, metodoPago: metodo, notas }),
      });
      if (!res.ok) { setError("Error al registrar. Intenta de nuevo."); return; }
      const result = await res.json();
      setMonto("");
      setNotas("");
      await cargar();
      if (result.pagado) onPagado();
    } catch {
      setError("Error al registrar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const porcentaje = resumen ? Math.min(100, Math.round((resumen.totalPagado / resumen.costo) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-[#0d0d0d] font-bold text-lg">Pago de evento</h2>
            <p className="text-gray-500 text-xs mt-0.5">{nombreAlumno} — {evento.nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
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
          ) : resumen ? (
            <>
              {/* Resumen de pago */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Costo del evento</span>
                  <span className="font-semibold text-gray-800">${resumen.costo.toLocaleString("es-MX")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total pagado</span>
                  <span className="font-semibold text-green-700">${resumen.totalPagado.toLocaleString("es-MX")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Saldo pendiente</span>
                  <span className={`font-bold ${resumen.falta > 0 ? "text-orange-600" : "text-green-600"}`}>
                    ${resumen.falta.toLocaleString("es-MX")}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${resumen.pagado ? "bg-green-500" : "bg-[#D4A017]"}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">{porcentaje}% pagado</p>
                </div>

                {resumen.pagado && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 text-sm font-semibold">Pago completado</span>
                  </div>
                )}
              </div>

              {/* Formulario nuevo pago */}
              {!resumen.pagado && (
                <form onSubmit={handlePago} className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Registrar abono</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Monto ($) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min={1}
                        max={resumen.falta}
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder={`Máx. $${resumen.falta.toLocaleString("es-MX")}`}
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
                    {guardando ? "Registrando..." : "Registrar pago"}
                  </button>
                </form>
              )}

              {/* Historial */}
              {resumen.historial.length > 0 && (
                <div>
                  <div className="border-t border-gray-300 mb-4" />
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Historial de pagos
                    <span className="ml-2 text-xs font-normal text-gray-400">({resumen.historial.length})</span>
                  </p>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {resumen.historial.map((p) => (
                      <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800">${p.monto.toLocaleString("es-MX")}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmtFecha(p.fechaPago)} · {p.metodoPago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
                            {p.notas && ` · ${p.notas}`}
                          </p>
                        </div>
                        {p.registradoPor && (
                          <span className="text-xs text-gray-400 whitespace-nowrap">{p.registradoPor}</span>
                        )}
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
