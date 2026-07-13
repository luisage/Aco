"use client";
import { useCallback, useEffect, useState } from "react";
import ModalAgregarApartado from "./ModalAgregarApartado";
import ModalDetalleApartado from "./ModalDetalleApartado";

export interface Apartado {
  id: number;
  alumnoNombre: string;
  fechaApartado: string;
  total: number;
  totalAbonado: number;
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO";
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function badgeEstado(estado: Apartado["estado"]) {
  if (estado === "COMPLETADO")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completado</span>;
  if (estado === "CANCELADO")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Cancelado</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Pendiente</span>;
}

export default function ApartadosClient() {
  const [apartados, setApartados] = useState<Apartado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/apartados");
      const data = await res.json();
      setApartados(Array.isArray(data) ? data : []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function handleCreated(nuevo: Apartado) {
    setApartados((prev) => [nuevo, ...prev]);
    setShowModal(false);
  }

  return (
    <div>
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          {apartados.length} {apartados.length === 1 ? "apartado" : "apartados"}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-14">
          <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : apartados.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-16 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4m8-9v2" />
          </svg>
          <p className="text-gray-400 text-sm">No hay apartados registrados</p>
          <p className="text-gray-300 text-xs mt-1">Agrega el primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto bg-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-100 border-b border-blue-200">
                  <th className="text-left px-3 sm:px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Alumno</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                  <th className="text-center px-3 sm:px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Abonado</th>
                  <th className="text-center px-3 sm:px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Total</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider hidden sm:table-cell">Estado</th>
                  <th className="px-2 sm:px-4 py-3.5 w-10 sm:w-12" />
                </tr>
              </thead>
              <tbody>
                {apartados.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-5 py-3.5 font-medium text-gray-800 max-w-[110px] sm:max-w-none truncate" title={a.alumnoNombre}>{a.alumnoNombre}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{fmtFecha(a.fechaApartado)}</td>
                    <td className="px-3 sm:px-5 py-3.5 text-center text-gray-800 font-medium whitespace-nowrap">
                      ${a.totalAbonado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 sm:px-5 py-3.5 text-center text-gray-800 font-semibold whitespace-nowrap">
                      ${a.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">{badgeEstado(a.estado)}</td>
                    <td className="px-2 sm:px-4 py-3.5">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setDetalleId(a.id)}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <ModalAgregarApartado
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {detalleId !== null && (
        <ModalDetalleApartado
          apartadoId={detalleId}
          onClose={() => setDetalleId(null)}
          onChanged={(actualizado) => {
            setApartados((prev) => prev.map((a) => a.id === actualizado.id ? actualizado : a));
          }}
        />
      )}
    </div>
  );
}
