"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toggleNovedadEstatus } from "@/app/actions/novedades";
import ModalAgregarNovedad from "./ModalAgregarNovedad";
import ModalEditarNovedad from "./ModalEditarNovedad";

interface Novedad {
  id: number;
  titulo: string;
  descripcion: string;
  vigencia: string | null;
  estatus: boolean;
  imagen: string | null;
  publicId: string | null;
}

export default function NovedadesPanel() {
  const [filtro, setFiltro] = useState<"activas" | "inactivas">("activas");
  const [datos, setDatos] = useState<Novedad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [novedadEditar, setNovedadEditar] = useState<Novedad | null>(null);
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchDatos = useCallback(async (f: "activas" | "inactivas") => {
    setCargando(true);
    try {
      const res = await fetch(`/api/novedades?estatus=${f === "activas"}`);
      const json = await res.json();
      setDatos(json);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchDatos(filtro); }, [filtro, fetchDatos]);

  // Cierra el menú al hacer click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleCreated(nueva: Novedad) {
    setModalOpen(false);
    if (filtro === "activas") setDatos((prev) => [nueva, ...prev]);
  }

  async function handleToggle(id: number, estatusActual: boolean) {
    setMenuAbierto(null);
    await toggleNovedadEstatus(id, !estatusActual);
    setDatos((prev) => prev.filter((n) => n.id !== id));
  }

  function handleEditar(novedad: Novedad) {
    setMenuAbierto(null);
    setNovedadEditar(novedad);
  }

  function handleUpdated(actualizada: Novedad) {
    setDatos((prev) => prev.map((n) => (n.id === actualizada.id ? actualizada : n)));
    setNovedadEditar(null);
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-blue-100 border-b border-blue-200">
        <div>
          <h2 className="text-[#0d0d0d] font-bold text-lg">Novedades</h2>
          <p className="text-gray-500 text-sm mt-0.5">Administra las novedades que se muestran en el inicio</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro */}
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as "activas" | "inactivas")}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer appearance-none pr-8 min-w-[130px]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "16px" }}
          >
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>

          {/* Agregar */}
          <button
            onClick={() => setModalOpen(true)}
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Título</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Descripción</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Vigencia</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Estatus</th>
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
                  No hay novedades {filtro}.
                </td>
              </tr>
            ) : (
              datos.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-800 text-sm font-medium max-w-[180px]">
                    <span className="line-clamp-2">{n.titulo}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-[280px]">
                    <span className="line-clamp-2">{n.descripcion}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm hidden sm:table-cell whitespace-nowrap">
                    {n.vigencia ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        n.estatus
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${n.estatus ? "bg-green-500" : "bg-gray-400"}`} />
                      {n.estatus ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative" ref={menuAbierto === n.id ? menuRef : null}>
                      <button
                        onClick={() => setMenuAbierto(menuAbierto === n.id ? null : n.id)}
                        className="text-gray-400 hover:text-[#003087] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Opciones"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                        </svg>
                      </button>

                      {menuAbierto === n.id && (
                        <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg w-44 py-1 overflow-hidden">
                          {/* Editar */}
                          <button
                            onClick={() => handleEditar(n)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4 text-[#003087]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          {/* Activar / Desactivar */}
                          <button
                            onClick={() => handleToggle(n.id, n.estatus)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            {n.estatus ? (
                              <>
                                <svg className="w-4 h-4 text-[#C8102E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Desactivar
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Activar
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal agregar */}
      {modalOpen && (
        <ModalAgregarNovedad
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Modal editar */}
      {novedadEditar && (
        <ModalEditarNovedad
          novedad={novedadEditar}
          onClose={() => setNovedadEditar(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
