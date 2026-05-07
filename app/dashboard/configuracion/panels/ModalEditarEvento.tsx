"use client";
import { useState } from "react";
import type { Evento } from "./EventosPanel";

const TIPOS = [
  { value: "TORNEO",     label: "Torneo"     },
  { value: "EXAMEN",     label: "Examen"     },
  { value: "SEMINARIO",  label: "Seminario"  },
  { value: "EXHIBICION", label: "Exhibición" },
  { value: "GRADUACION", label: "Graduación" },
  { value: "CAMPAMENTO", label: "Campamento" },
  { value: "OTRO",       label: "Otro"       },
];

interface Props {
  evento: Evento;
  onClose: () => void;
  onUpdated: (e: Evento) => void;
}

export default function ModalEditarEvento({ evento, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Fecha en formato YYYY-MM-DD para el input
  const fechaDefault = evento.fecha.slice(0, 10);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      nombre:      (fd.get("nombre") as string).trim(),
      tipoEvento:  fd.get("tipoEvento") as string,
      fecha:       fd.get("fecha") as string,
      hora:        (fd.get("hora") as string).trim() || null,
      costo:       fd.get("costo"),
      estado:      (fd.get("estado") as string).trim() || null,
      ciudad:      (fd.get("ciudad") as string).trim() || null,
      ubicacion:   (fd.get("ubicacion") as string).trim() || null,
      descripcion: (fd.get("descripcion") as string).trim() || null,
    };
    if (!body.nombre || !body.tipoEvento || !body.fecha || !body.costo) {
      setError("Nombre, tipo, fecha y costo son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/eventos/${evento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { setError("Error al actualizar. Intenta de nuevo."); return; }
      onUpdated(await res.json());
    } catch {
      setError("Error al actualizar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl flex-shrink-0">
          <h2 className="text-[#0d0d0d] font-bold text-lg">Editar evento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input name="nombre" type="text" required maxLength={200} defaultValue={evento.nombre}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50" />
          </div>

          {/* Tipo + Costo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo <span className="text-red-500">*</span></label>
              <select name="tipoEvento" required defaultValue={evento.tipoEvento}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "14px" }}
              >
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo ($) <span className="text-red-500">*</span></label>
              <input name="costo" type="number" required min={0} defaultValue={evento.costo}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50" />
            </div>
          </div>

          {/* Fecha + Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
              <input name="fecha" type="date" required defaultValue={fechaDefault}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input name="hora" type="text" placeholder="09:00" maxLength={10} defaultValue={evento.hora ?? ""}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50" />
            </div>
          </div>

          {/* Estado + Ciudad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input name="estado" type="text" maxLength={100} defaultValue={evento.estado ?? ""}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input name="ciudad" type="text" maxLength={100} defaultValue={evento.ciudad ?? ""}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50" />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input name="ubicacion" type="text" maxLength={200} defaultValue={evento.ubicacion ?? ""}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea name="descripcion" rows={2} maxLength={500} defaultValue={evento.descripcion ?? ""}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 resize-none" />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#003087] hover:bg-[#002060] text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
