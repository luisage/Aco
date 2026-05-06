"use client";
import { useEffect, useState } from "react";
import { registrarPago } from "@/app/actions/pagos";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

interface PagoInfo {
  alumno: { id: number; nombre: string; apellido: string; telefono: string | null };
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

interface PagoResultado {
  monto: number;
  esCompleto: boolean;
  faltaRestante: number;
  mesLabel: string;
  nombreAlumno: string;
  telefono: string | null;
}

interface Props {
  alumnoId: number;
  onClose: () => void;
  onPagoRegistrado: () => void;
}

function formatearTelefono(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  if (digits.startsWith("52") && digits.length >= 12) return digits;
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

function construirMensaje(r: PagoResultado): string {
  const montoFmt = `$${r.monto.toLocaleString("es-MX")}`;
  const faltaFmt = `$${r.faltaRestante.toLocaleString("es-MX")}`;

  if (r.esCompleto) {
    return (
      `¡Hola! Le confirmamos que el pago de *${r.nombreAlumno}* ha sido registrado exitosamente.\n\n` +
      `📋 *Detalle del pago*\n` +
      `• Mensualidad: *${r.mesLabel}*\n` +
      `• Monto pagado: *${montoFmt}*\n` +
      `• Estado: Completado ✅\n\n` +
      `¡Gracias por su pago! 🥋\n_ACO Doyang_`
    );
  }
  return (
    `¡Hola! Le confirmamos que se registró un abono de *${r.nombreAlumno}*.\n\n` +
    `📋 *Detalle del pago*\n` +
    `• Mensualidad: *${r.mesLabel}*\n` +
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

export default function ModalRegistrarPago({ alumnoId, onClose, onPagoRegistrado }: Props) {
  const [info, setInfo] = useState<PagoInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "TRANSFERENCIA">("EFECTIVO");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [pagoResultado, setPagoResultado] = useState<PagoResultado | null>(null);

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
      const esCompleto = montoNum >= info.faltaPagar;
      setPagoResultado({
        monto: montoNum,
        esCompleto,
        faltaRestante: Math.max(0, info.faltaPagar - montoNum),
        mesLabel: info.mesLabel,
        nombreAlumno: `${info.alumno.nombre} ${info.alumno.apellido}`,
        telefono: info.alumno.telefono ?? null,
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
          ) : exito && pagoResultado ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold text-base">Pago registrado correctamente</p>

              {/* Resumen del pago */}
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mensualidad</span>
                  <span className="font-semibold text-gray-800">{pagoResultado.mesLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monto pagado</span>
                  <span className="font-semibold text-gray-800">
                    ${pagoResultado.monto.toLocaleString("es-MX")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estado</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    pagoResultado.esCompleto
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {pagoResultado.esCompleto ? "Completado" : "Parcial"}
                  </span>
                </div>
                {!pagoResultado.esCompleto && (
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-500">Saldo pendiente</span>
                    <span className="font-semibold text-red-600">
                      ${pagoResultado.faltaRestante.toLocaleString("es-MX")}
                    </span>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="w-full flex flex-col gap-2 mt-1">
                {pagoResultado.telefono ? (
                  <button
                    onClick={() => abrirWhatsApp(
                      pagoResultado.telefono!,
                      construirMensaje(pagoResultado)
                    )}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:bg-[#1ebe5d] transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Enviar por WhatsApp
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 text-center">
                    Sin número de teléfono registrado
                  </p>
                )}
                <button
                  onClick={onPagoRegistrado}
                  className="w-full py-2.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
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
