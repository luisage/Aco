"use client";
import { useEffect, useState } from "react";
import { registrarPago } from "@/app/actions/pagos";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

interface PagoInfo {
  alumno: { id: number; nombre: string; apellido: string };
  mesCorrespondiente: string;
  mesLabel: string;
  costoBase: number;
  costoExtra: number;
  extraDescripcion: string | null;
  costoTotal: number;
  yaCompletado: boolean;
  pagosDelMes: {
    id: number;
    monto: number;
    fechaPago: string;
    estadoPago: string;
    metodoPago: string;
  }[];
  totalPagado: number;
  faltaPagar: number;
}

interface Props {
  alumnoId: number;
  onClose: () => void;
  onPagoRegistrado: () => void;
}

export default function ModalRegistrarPago({ alumnoId, onClose, onPagoRegistrado }: Props) {
  const [info, setInfo] = useState<PagoInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`/api/pagos/info?alumnoId=${alumnoId}`);
        const json = await res.json();
        if (!res.ok) { setError(json.error ?? "Error al cargar información"); return; }
        setInfo(json);
        setMonto(String(json.faltaPagar));
      } catch {
        setError("Error al cargar información del pago.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [alumnoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!info) return;
    const montoNum = parseInt(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await registrarPago({
        alumnoId,
        monto: montoNum,
        metodoPago,
        notas: notas.trim() || undefined,
        mesCorrespondiente: info.mesCorrespondiente,
        costoTotal: info.costoTotal,
        totalPagadoPrevio: info.totalPagado,
      });
      setExito(true);
    } catch {
      setError("Error al registrar el pago. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-100 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="font-bold text-[#0d0d0d] text-lg">Registrar pago</h2>
            {info && (
              <p className="text-sm text-gray-600 mt-0.5">
                {info.alumno.nombre} {info.alumno.apellido}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cargando ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : exito ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Pago registrado correctamente</p>
              <button
                onClick={onPagoRegistrado}
                className="mt-2 px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : info ? (
            <>
              {/* Mes */}
              <div className="mb-5">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-[#003087]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {info.mesLabel}
                </span>
              </div>

              {/* Desglose costos */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-5">
                <div className="px-4 py-3 flex justify-between items-center text-sm">
                  <span className="text-gray-600">Mensualidad base</span>
                  <span className="font-semibold text-gray-800">${info.costoBase.toLocaleString("es-MX")}</span>
                </div>
                {info.costoExtra > 0 && (
                  <div className="px-4 py-3 flex justify-between items-center text-sm border-t border-gray-200 bg-amber-50">
                    <span className="text-amber-700">
                      Cargo por retraso
                      {info.extraDescripcion && (
                        <span className="ml-1 text-xs text-amber-600">({info.extraDescripcion})</span>
                      )}
                    </span>
                    <span className="font-semibold text-amber-700">+${info.costoExtra.toLocaleString("es-MX")}</span>
                  </div>
                )}
                <div className="px-4 py-3 flex justify-between items-center text-sm border-t border-gray-200 bg-gray-100">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-gray-900">${info.costoTotal.toLocaleString("es-MX")}</span>
                </div>
              </div>

              {/* Pagos parciales anteriores */}
              {info.pagosDelMes.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Pagos registrados este mes
                  </h3>
                  <div className="space-y-2">
                    {info.pagosDelMes.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.estadoPago === "COMPLETO" ? "bg-green-500" : "bg-amber-400"}`} />
                          <span className="text-gray-600">{p.fechaPago}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500 text-xs capitalize">{p.metodoPago.toLowerCase()}</span>
                        </div>
                        <span className="font-semibold text-gray-800">${p.monto.toLocaleString("es-MX")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen pendiente */}
              {info.yaCompletado ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl mb-5">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-green-700">Mensualidad completamente pagada</p>
                </div>
              ) : info.pagosDelMes.length > 0 ? (
                <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <span className="text-sm font-medium text-red-700">Falta por pagar</span>
                  <span className="text-lg font-bold text-red-700">${info.faltaPagar.toLocaleString("es-MX")}</span>
                </div>
              ) : null}

              {/* Formulario */}
              {!info.yaCompletado && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto a pagar</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        min={1}
                        max={info.faltaPagar}
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value as "EFECTIVO" | "TRANSFERENCIA")}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 10px center",
                        backgroundSize: "16px",
                      }}
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      rows={2}
                      placeholder="Observaciones sobre el pago…"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={guardando}
                    className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {guardando ? "Registrando…" : "Registrar pago"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <p className="text-center text-red-600 text-sm py-8">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
