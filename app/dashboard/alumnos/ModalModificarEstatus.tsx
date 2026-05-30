"use client";
import { useState } from "react";
import { modificarEstatusAlumno } from "@/app/actions/alumnos";

type EstadoAlumno = "ACTIVO" | "INACTIVO" | "BAJA";

const ESTATUS_OPTS: { value: EstadoAlumno; label: string }[] = [
  { value: "ACTIVO",   label: "Activo"   },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "BAJA",     label: "Baja"     },
];

interface Props {
  alumnoId: number;
  alumnoNombre: string;
  estatusActual: EstadoAlumno;
  onClose: () => void;
  onActualizado: () => void;
}

export default function ModalModificarEstatus({ alumnoId, alumnoNombre, estatusActual, onClose, onActualizado }: Props) {
  const [estatus, setEstatus] = useState<EstadoAlumno>(estatusActual);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar() {
    setGuardando(true);
    setError(null);
    try {
      await modificarEstatusAlumno(alumnoId, estatus);
      onActualizado();
    } catch {
      setError("No se pudo guardar el estatus. Intenta de nuevo.");
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-100 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="font-bold text-[#0d0d0d] text-lg">Modificar estatus</h2>
            <p className="text-sm text-gray-600 mt-0.5">{alumnoNombre}</p>
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
        <div className="flex-1 px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estatus</label>
            <select
              value={estatus}
              onChange={(e) => setEstatus(e.target.value as EstadoAlumno)}
              disabled={guardando}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 appearance-none disabled:opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: "16px",
              }}
            >
              {ESTATUS_OPTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="w-full py-2.5 bg-[#003087] text-white text-sm font-semibold rounded-xl hover:bg-[#002070] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {guardando && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
