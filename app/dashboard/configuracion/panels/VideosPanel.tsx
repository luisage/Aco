"use client";
import { useCallback, useEffect, useState } from "react";
import { eliminarVideo } from "@/app/actions/videos";
import ModalAgregarVideo from "./ModalAgregarVideo";
import ModalEditarVideo from "./ModalEditarVideo";

interface Video {
  id: number;
  nombre: string | null;
  descripcion: string | null;
  url: string;
  publicId: string;
  estatus: boolean;
  orden: number;
}

// Deriva miniatura del video desde la URL de Cloudinary
function getVideoThumbnail(url: string): string {
  return url
    .replace("/video/upload/", "/video/upload/so_auto,w_200,h_120,c_fill/")
    .replace(/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i, ".jpg");
}

export default function VideosPanel() {
  const [filtro, setFiltro] = useState<"activos" | "inactivos">("activos");
  const [datos, setDatos] = useState<Video[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [videoEditar, setVideoEditar] = useState<Video | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const fetchDatos = useCallback(async (f: "activos" | "inactivos") => {
    setCargando(true);
    try {
      const res = await fetch(`/api/videos?estatus=${f === "activos"}`);
      const json = await res.json();
      setDatos(json);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchDatos(filtro); }, [filtro, fetchDatos]);

  function handleCreated(nuevo: Video) {
    setModalAgregar(false);
    if (filtro === "activos") setDatos((prev) => [...prev, nuevo]);
  }

  function handleUpdated(actualizado: Video) {
    setVideoEditar(null);
    const coincide = filtro === "activos" ? actualizado.estatus : !actualizado.estatus;
    if (!coincide) {
      setDatos((prev) => prev.filter((v) => v.id !== actualizado.id));
    } else {
      setDatos((prev) => prev.map((v) => v.id === actualizado.id ? actualizado : v));
    }
  }

  async function handleEliminar(video: Video) {
    setEliminandoId(video.id);
    try {
      await eliminarVideo(video.id, video.publicId);
      setDatos((prev) => prev.filter((v) => v.id !== video.id));
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
          <h2 className="text-[#0d0d0d] font-bold text-lg">Videos</h2>
          <p className="text-gray-500 text-sm mt-0.5">Administra los videos que se muestran en el inicio</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "activos" | "inactivos")}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer appearance-none pr-8 min-w-[130px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "16px",
            }}
          >
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
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
            <col style={{ width: "18%" }} />
            <col style={{ width: "27%" }} />
            <col style={{ width: "27%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Vista previa</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden md:table-cell">Descripción</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Estatus</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No hay videos {filtro}.
                </td>
              </tr>
            ) : (
              datos.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Miniatura */}
                  <td className="px-4 py-3">
                    <div className="relative w-full aspect-video max-w-[100px] bg-black rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={getVideoThumbnail(v.url)}
                        alt={v.nombre ?? "Video"}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-700 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <p className="text-gray-800 text-sm font-medium line-clamp-2">
                      {v.nombre ?? <span className="text-gray-400 font-normal">Sin nombre</span>}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">Orden: {v.orden}</p>
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-3 text-gray-600 text-sm hidden md:table-cell">
                    <span className="line-clamp-2">
                      {v.descripcion ?? <span className="text-gray-300">—</span>}
                    </span>
                  </td>

                  {/* Estatus */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      v.estatus
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-100 text-gray-400 border-gray-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${v.estatus ? "bg-green-500" : "bg-gray-400"}`} />
                      {v.estatus ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    {confirmDeleteId === v.id ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-gray-600 whitespace-nowrap">¿Eliminar?</span>
                        <button
                          onClick={() => handleEliminar(v)}
                          disabled={eliminandoId === v.id}
                          className="px-2.5 py-1 rounded-lg bg-[#C8102E] hover:bg-[#a00e26] text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {eliminandoId === v.id
                            ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            : "Sí"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={eliminandoId === v.id}
                          className="px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-200 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setVideoEditar(v)}
                          className="text-[#003087] hover:text-[#002060] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          aria-label="Editar video"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(v.id)}
                          className="text-[#C8102E] hover:text-[#a00e26] p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label="Eliminar video"
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
        <ModalAgregarVideo
          onClose={() => setModalAgregar(false)}
          onCreated={handleCreated}
        />
      )}

      {videoEditar && (
        <ModalEditarVideo
          video={videoEditar}
          onClose={() => setVideoEditar(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
