"use client";
import { useCallback, useEffect, useState } from "react";
import ModalAgregarProducto from "./ModalAgregarProducto";
import ModalEditarProducto from "./ModalEditarProducto";
import ModalQRProducto from "./ModalQRProducto";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  descripcionVenta: string | null;
  cantidad: number;
  costo: number;
  categoria: string;
  imagen: string | null;
  publicId: string | null;
  estatus: boolean;
}

function formatCosto(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

export default function ProductosPanel({ role }: { role: string }) {
  const [filtro, setFiltro] = useState<"activos" | "inactivos">("activos");
  const [datos, setDatos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [productoQR, setProductoQR] = useState<Producto | null>(null);

  const fetchDatos = useCallback(async (f: "activos" | "inactivos") => {
    setCargando(true);
    try {
      const res = await fetch(`/api/productos?estatus=${f === "activos"}&excluirCategoria=Tienda`);
      const json = await res.json();
      setDatos(json);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchDatos(filtro); }, [filtro, fetchDatos]);

  function handleCreated(nuevo: Producto) {
    setModalAgregar(false);
    if (filtro === "activos") {
      setDatos((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    }
  }

  function handleUpdated(actualizado: Producto) {
    setProductoEditar(null);
    const coincide = filtro === "activos" ? actualizado.estatus : !actualizado.estatus;
    if (!coincide) {
      setDatos((prev) => prev.filter((p) => p.id !== actualizado.id));
    } else {
      setDatos((prev) =>
        prev.map((p) => p.id === actualizado.id ? actualizado : p)
           .sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-blue-100 border-b border-blue-200">
        <div>
          <h2 className="text-[#0d0d0d] font-bold text-lg">Productos</h2>
          <p className="text-gray-500 text-sm mt-0.5">Administra el catálogo de productos de la tienda</p>
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider w-16">Imagen</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden md:table-cell">Categoría</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden lg:table-cell">Des. venta</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Costo</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Cantidad</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Estatus</th>
              <th className="px-4 py-3.5 w-14" />
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No hay productos {filtro}.
                </td>
              </tr>
            ) : (
              datos.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Imagen */}
                  <td className="px-4 py-3">
                    {p.imagen ? (
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <p className="text-gray-800 text-sm font-medium line-clamp-1">{p.nombre}</p>
                    <p className="text-gray-400 text-xs line-clamp-1 mt-0.5 hidden sm:block">{p.descripcion}</p>
                  </td>
                  {/* Categoría */}
                  <td className="px-4 py-3 text-gray-600 text-sm hidden md:table-cell whitespace-nowrap">
                    {p.categoria}
                  </td>
                  {/* Des. venta */}
                  <td className="px-4 py-3 text-gray-600 text-sm hidden lg:table-cell max-w-[200px]">
                    <span className="line-clamp-2">{p.descripcionVenta ?? <span className="text-gray-300">—</span>}</span>
                  </td>
                  {/* Costo */}
                  <td className="px-4 py-3 text-gray-800 text-sm font-medium whitespace-nowrap text-center">
                    {formatCosto(p.costo)}
                  </td>
                  {/* Cantidad */}
                  <td className="px-4 py-3 text-gray-800 text-sm hidden sm:table-cell text-center">
                    {p.cantidad}
                  </td>
                  {/* Estatus */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        p.estatus
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.estatus ? "bg-green-500" : "bg-gray-400"}`} />
                      {p.estatus ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setProductoEditar(p)}
                        className="text-[#003087] hover:text-[#002060] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Editar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setProductoQR(p)}
                        className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Ver código QR"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAgregar && (
        <ModalAgregarProducto
          onClose={() => setModalAgregar(false)}
          onCreated={handleCreated}
        />
      )}

      {productoEditar && (
        <ModalEditarProducto
          producto={productoEditar}
          onClose={() => setProductoEditar(null)}
          onUpdated={handleUpdated}
          role={role}
        />
      )}

      {productoQR && (
        <ModalQRProducto
          producto={productoQR}
          onClose={() => setProductoQR(null)}
        />
      )}
    </div>
  );
}
