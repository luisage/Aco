"use client";
import { useCallback, useEffect, useState } from "react";
import ModalAgregarCategoria from "./ModalAgregarCategoria";
import ModalEditarCategoria from "./ModalEditarCategoria";

interface Categoria {
  id: number;
  nombre: string;
  estatus: boolean;
}

export default function CategoriasPanel() {
  const [filtro, setFiltro] = useState<"activas" | "inactivas">("activas");
  const [datos, setDatos] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(null);

  const fetchDatos = useCallback(async (f: "activas" | "inactivas") => {
    setCargando(true);
    try {
      const res = await fetch(`/api/categorias?estatus=${f === "activas"}`);
      const json = await res.json();
      setDatos(json);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchDatos(filtro); }, [filtro, fetchDatos]);

  function handleCreated(nueva: Categoria) {
    setModalAgregar(false);
    if (filtro === "activas") setDatos((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }

  function handleUpdated(actualizada: Categoria) {
    setCategoriaEditar(null);
    const coincide = filtro === "activas" ? actualizada.estatus : !actualizada.estatus;
    if (!coincide) {
      setDatos((prev) => prev.filter((c) => c.id !== actualizada.id));
    } else {
      setDatos((prev) =>
        prev.map((c) => c.id === actualizada.id ? actualizada : c)
           .sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-blue-100 border-b border-blue-200">
        <div>
          <h2 className="text-[#0d0d0d] font-bold text-lg">Categorías de productos</h2>
          <p className="text-gray-500 text-sm mt-0.5">Administra las categorías disponibles para los productos</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro */}
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

          {/* Agregar */}
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Nombre</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Estatus</th>
              <th className="px-4 py-3.5 w-16" />
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No hay categorías {filtro}.
                </td>
              </tr>
            ) : (
              datos.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 text-sm font-medium">{c.nombre}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        c.estatus
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.estatus ? "bg-green-500" : "bg-gray-400"}`} />
                      {c.estatus ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setCategoriaEditar(c)}
                      className="text-[#003087] hover:text-[#002060] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Editar categoría"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAgregar && (
        <ModalAgregarCategoria
          onClose={() => setModalAgregar(false)}
          onCreated={handleCreated}
        />
      )}

      {categoriaEditar && (
        <ModalEditarCategoria
          categoria={categoriaEditar}
          onClose={() => setCategoriaEditar(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
