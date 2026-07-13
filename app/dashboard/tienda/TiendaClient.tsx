"use client";
import { useState } from "react";
import ModalAgregarDulce from "./ModalAgregarDulce";
import ModalEditarDulce from "./ModalEditarDulce";
import ModalQRDulce from "./ModalQRDulce";
import VentasClient from "./VentasClient";
import ApartadosClient from "./ApartadosClient";

type Tab = "dulces" | "ventas" | "apartados";

interface Dulce {
  id: number;
  nombre: string;
  descripcion: string;
  costo: number;
  cantidad: number;
  estatus: boolean;
}

interface Props {
  dulcesIniciales: Dulce[];
  role: string;
}

export default function TiendaClient({ dulcesIniciales, role }: Props) {
  const [tab, setTab] = useState<Tab>("ventas");
  const [dulces, setDulces] = useState<Dulce[]>(dulcesIniciales);
  const [showModal, setShowModal] = useState(false);
  const [dulceEditar, setDulceEditar] = useState<Dulce | null>(null);
  const [dulceQR, setDulceQR] = useState<Dulce | null>(null);
  const [filtroEstatus, setFiltroEstatus] = useState<"todos" | "activo" | "inactivo">("todos");

  function handleCreated(nuevo: Dulce) {
    setDulces((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setShowModal(false);
  }

  function handleUpdated(actualizado: Dulce) {
    setDulces((prev) =>
      prev.map((d) => d.id === actualizado.id ? actualizado : d)
         .sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    setDulceEditar(null);
  }

  const dulcesFiltrados = dulces.filter((d) => {
    if (filtroEstatus === "activo") return d.estatus;
    if (filtroEstatus === "inactivo") return !d.estatus;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tienda</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestión de dulces y registro de ventas</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-blue-100 rounded-xl p-1 gap-1 mb-6 w-full sm:w-fit overflow-x-auto">
        {([
          { key: "ventas" as Tab, label: "Ventas", icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )},
          { key: "dulces" as Tab, label: "Dulces", icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/>
              <path d="m3.5 11 1.6 7.4a2 2 0 0 0 1.96 1.6h9.08a2 2 0 0 0 1.96-1.6l1.6-7.4"/>
              <path d="m9 11 1 9"/><path d="M4.5 15.5h15"/><path d="m15 11-1 9"/>
            </svg>
          )},
          { key: "apartados" as Tab, label: "Apartar", icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6" />
              <path d="M20 13v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" />
              <path d="M4 13h16" /><path d="M12 4v2" />
            </svg>
          )},
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
              tab === key
                ? "bg-white text-[#003087] shadow-sm border-b-2 border-[#D4A017]"
                : "text-blue-700 hover:text-[#003087] hover:bg-white/50"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Panel Dulces */}
      {tab === "dulces" && (
        <div>
          {/* Barra superior */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500">
              {dulcesFiltrados.length} {dulcesFiltrados.length === 1 ? "dulce" : "dulces"}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={filtroEstatus}
                onChange={(e) => setFiltroEstatus(e.target.value as typeof filtroEstatus)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
              >
                <option value="todos">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar dulce
              </button>
            </div>
          </div>

          {/* Tabla */}
          {dulcesFiltrados.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-16 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
              </svg>
              <p className="text-gray-400 text-sm">No hay dulces registrados</p>
              <p className="text-gray-300 text-xs mt-1">Agrega el primer dulce con el botón de arriba</p>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto bg-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-100 border-b border-blue-200">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Nombre</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider hidden sm:table-cell">Descripción</th>
                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Costo</th>
                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Existencia</th>
                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#003087] uppercase tracking-wider">Estatus</th>
                      <th className="px-4 py-3.5 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {dulcesFiltrados.map((d) => (
                      <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-800">{d.nombre}</td>
                        <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell max-w-[220px] truncate">
                          {d.descripcion}
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-800 font-medium">
                          ${d.costo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`font-semibold ${d.cantidad === 0 ? "text-[#C8102E]" : "text-gray-800"}`}>
                            {d.cantidad}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            d.estatus
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {d.estatus ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setDulceEditar(d)}
                              className="text-gray-400 hover:text-[#003087] transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDulceQR(d)}
                              className="text-gray-400 hover:text-[#003087] transition-colors"
                              title="Código QR"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
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
        </div>
      )}

      {/* Panel Ventas */}
      {tab === "ventas" && <VentasClient />}

      {/* Panel Apartados */}
      {tab === "apartados" && <ApartadosClient />}

      {showModal && (
        <ModalAgregarDulce
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {dulceEditar && (
        <ModalEditarDulce
          dulce={dulceEditar}
          onClose={() => setDulceEditar(null)}
          onUpdated={handleUpdated}
          role={role}
        />
      )}

      {dulceQR && (
        <ModalQRDulce
          dulce={dulceQR}
          onClose={() => setDulceQR(null)}
        />
      )}
    </div>
  );
}
