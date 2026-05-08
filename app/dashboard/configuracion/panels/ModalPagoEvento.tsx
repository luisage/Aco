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

interface UltimoPago {
  monto: number;
  esCompleto: boolean;
  falta: number;
}

interface Props {
  evento: Evento;
  alumnoId: number;
  nombreAlumno: string;
  telefono: string | null;
  onClose: () => void;
  onPagado: () => void;
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });
}

function formatearTelefono(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  if (digits.startsWith("52") && digits.length >= 12) return digits;
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

function construirMensaje(nombreAlumno: string, eventoNombre: string, pago: UltimoPago): string {
  const montoFmt = `$${pago.monto.toLocaleString("es-MX")}`;
  const faltaFmt = `$${pago.falta.toLocaleString("es-MX")}`;

  if (pago.esCompleto) {
    return (
      `¡Hola! Le confirmamos que el pago del evento de *${nombreAlumno}* ha sido registrado exitosamente.\n\n` +
      `📋 *Detalle del pago*\n` +
      `• Evento: *${eventoNombre}*\n` +
      `• Monto pagado: *${montoFmt}*\n` +
      `• Estado: Completado ✅\n\n` +
      `¡Gracias por su pago! 🥋\n_ACO Doyang_`
    );
  }
  return (
    `¡Hola! Le confirmamos que se registró un abono del evento de *${nombreAlumno}*.\n\n` +
    `📋 *Detalle del pago*\n` +
    `• Evento: *${eventoNombre}*\n` +
    `• Abono registrado: *${montoFmt}*\n` +
    `• Saldo pendiente: *${faltaFmt}*\n` +
    `• Estado: Pago parcial ⚠️\n\n` +
    `Le recordamos cubrir el saldo a la brevedad. 🙏\n_ACO Doyang_`
  );
}

function abrirWhatsApp(telefono: string, mensaje: string) {
  const phone = formatearTelefono(telefono);
  const texto = encodeURIComponent(mensaje);
  const isTabletOrMobile = /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent);
  const url = isTabletOrMobile
    ? `https://wa.me/${phone}?text=${texto}`
    : `https://web.whatsapp.com/send?phone=${phone}&text=${texto}`;
  window.open(url, "_blank");
}

export default function ModalPagoEvento({ evento, alumnoId, nombreAlumno, telefono, onClose, onPagado }: Props) {
  const [resumen, setResumen]       = useState<ResumenPago | null>(null);
  const [cargando, setCargando]     = useState(true);
  const [monto, setMonto]           = useState("");
  const [metodo, setMetodo]         = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");
  const [notas, setNotas]           = useState("");
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState("");
  const [ultimoPago, setUltimoPago] = useState<UltimoPago | null>(null);

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
      const nuevaFalta = result.falta as number;
      setUltimoPago({ monto: montoNum, esCompleto: result.pagado, falta: nuevaFalta });
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

              {/* Confirmación del último pago + WhatsApp */}
              {ultimoPago && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Pago registrado correctamente</p>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 pl-9">
                    <div className="flex justify-between">
                      <span>Monto registrado</span>
                      <span className="font-semibold text-gray-800">${ultimoPago.monto.toLocaleString("es-MX")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado</span>
                      <span className={`font-semibold ${ultimoPago.esCompleto ? "text-green-700" : "text-orange-600"}`}>
                        {ultimoPago.esCompleto ? "Completado ✅" : "Parcial ⚠️"}
                      </span>
                    </div>
                    {!ultimoPago.esCompleto && (
                      <div className="flex justify-between">
                        <span>Saldo pendiente</span>
                        <span className="font-semibold text-orange-600">${ultimoPago.falta.toLocaleString("es-MX")}</span>
                      </div>
                    )}
                  </div>

                  {telefono ? (
                    <button
                      onClick={() => abrirWhatsApp(telefono, construirMensaje(nombreAlumno, evento.nombre, ultimoPago))}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Enviar por WhatsApp
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 text-center">Sin número de teléfono registrado</p>
                  )}
                </div>
              )}

              {/* Formulario nuevo pago */}
              {!resumen.pagado && (
                <form onSubmit={handlePago} className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {ultimoPago ? "Registrar otro abono" : "Registrar abono"}
                  </p>

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
