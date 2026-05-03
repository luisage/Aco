"use client";
import { useCallback, useEffect, useState } from "react";
import { eliminarImagenCarrusel } from "@/app/actions/imagenCarrusel";
import ModalAgregarImagenCarrusel from "./ModalAgregarImagenCarrusel";
import ModalEditarImagenCarrusel from "./ModalEditarImagenCarrusel";

interface ImagenCarrusel {
  id: number;
  nombre: string | null;
  url: string;
  publicId: string | null;
  estatus: boolean;
}

export default function ImagenCarruselPanel() {
  const [filtro, setFiltro] = useState<"activas" | "inactivas">("activas");
  const [datos, setDatos] = useState<ImagenCarrusel[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [imagenEditar, setImagenEditar] = useState<ImagenCarrusel | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const fetchDatos = useCallback(async (f: "activas" | "inactivas") => {
    setCargando(true);
    try {
      const res = await fetch(`/api/carrusel?estatus=${f === "activas"}`);
      const json = await res.json();
      setDatos(json);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchDatos(filtro); }, [filtro, fetchDatos]);

  function handleCreated(nueva: ImagenCarrusel) {
    setModalAgregar(false);
    if (filtro === "activas") setDatos((prev) => [...prev, nueva]);
  }

  function handleUpdated(actualizada: ImagenCarrusel) {
    setImagenEditar(null);
    const coincide = filtro === "activas" ? actualizada.estatus : !actualizada.estatus;
    if (!coincide) {
      setDatos((prev) => prev.filter((img) => img.id !== actualizada.id));
    } else {
      setDatos((prev) => prev.map((img) => img.id === actualizada.id ? actualizada : img));
    }
  }

  async function handleEliminar(img: ImagenCarrusel) {
    setEliminandoId(img.id);
    try {
      await eliminarImagenCarrusel(img.id, img.publicId);
      setDatos((prev) => prev.filter((i) => i.id !== img.id));
    } finally {
      setEliminandoId(null);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-blue-100 border-b border-blue-200">
        <div>
          <h2 className="text-[#0d0d0d] font-bold text-lg">Imágenes de carrusel</h2>
          <p className="text-gray-500 text-sm mt-0.5">Administra las imágenes que aparecen en el carrusel del inicio</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "activas" | "inactivas")}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer appearance-none pr-8 min-w-[130px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "16px",
            }}
          >
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>

          <button
            onClick={() => setModalAgregar(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-gray-200">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "40%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Imagen</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Estatus</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No hay imágenes {filtro}.
                </td>
              </tr>
            ) : (
              datos.map((img) => (
                <tr key={img.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Imagen */}
                  <td className="px-4 py-3">
                    <img
                      src={img.url}
                      alt={img.nombre ?? "Imagen carrusel"}
                      className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3 text-gray-800 text-sm font-medium">
                    {img.nombre ?? <span className="text-gray-400 font-normal">Sin nombre</span>}
                  </td>

                  {/* Estatus */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        img.estatus
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${img.estatus ? "bg-green-500" : "bg-gray-400"}`} />
                      {img.estatus ? "Activa" : "Inactiva"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    {confirmDeleteId === img.id ? (
                      /* Confirmación inline */
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-gray-600 whitespace-nowrap">¿Eliminar?</span>
                        <button
                          onClick={() => handleEliminar(img)}
                          disabled={eliminandoId === img.id}
                          className="px-2.5 py-1 rounded-lg bg-[#C8102E] hover:bg-[#a00e26] text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {eliminandoId === img.id
                            ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            : "Sí"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={eliminandoId === img.id}
                          className="px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-200 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        {/* Editar */}
                        <button
                          onClick={() => setImagenEditar(img)}
                          className="text-[#003087] hover:text-[#002060] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          aria-label="Editar imagen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Eliminar */}
                        <button
                          onClick={() => setConfirmDeleteId(img.id)}
                          className="text-[#C8102E] hover:text-[#a00e26] p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label="Eliminar imagen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAgregar && (
        <ModalAgregarImagenCarrusel
          onClose={() => setModalAgregar(false)}
          onCreated={handleCreated}
        />
      )}

      {imagenEditar && (
        <ModalEditarImagenCarrusel
          imagen={imagenEditar}
          onClose={() => setImagenEditar(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
