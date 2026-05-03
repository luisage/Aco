"use client";
import { useCallback, useEffect, useState } from "react";
import ModalAgregarUsuario from "./ModalAgregarUsuario";
import ModalEditarUsuario from "./ModalEditarUsuario";

type Role = "SUPERADMIN" | "ADMIN" | "USER";

interface Usuario {
  id: number;
  usuario: string | null;
  nombre: string | null;
  apellido: string | null;
  role: Role;
  estatus: boolean;
}

const ROL_BADGE: Record<Role, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-700 border-purple-300",
  ADMIN:      "bg-blue-100 text-[#003087] border-blue-300",
  USER:       "bg-gray-100 text-gray-600 border-gray-200",
};
const ROL_LABEL: Record<Role, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN:      "Admin",
  USER:       "Usuario",
};

export default function UsuariosPanel() {
  const [filtro, setFiltro] = useState<"activos" | "inactivos">("activos");
  const [datos, setDatos] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);

  const fetchDatos = useCallback(async (f: "activos" | "inactivos") => {
    setCargando(true);
    try {
      const res = await fetch(`/api/usuarios?estatus=${f === "activos"}`);
      const json = await res.json();
      setDatos(Array.isArray(json) ? json : []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchDatos(filtro); }, [filtro, fetchDatos]);

  function handleCreated(nuevo: Usuario) {
    setModalAgregar(false);
    if (filtro === "activos") setDatos((prev) => [nuevo, ...prev]);
  }

  function handleUpdated(actualizado: Usuario) {
    setUsuarioEditar(null);
    const coincide = filtro === "activos" ? actualizado.estatus : !actualizado.estatus;
    if (!coincide) {
      setDatos((prev) => prev.filter((u) => u.id !== actualizado.id));
    } else {
      setDatos((prev) => prev.map((u) => u.id === actualizado.id ? actualizado : u));
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-blue-100 border-b border-blue-200">
        <div>
          <h2 className="text-[#0d0d0d] font-bold text-lg">Usuarios</h2>
          <p className="text-gray-500 text-sm mt-0.5">Administra los usuarios con acceso al sistema</p>
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
            <col style={{ width: "28%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "8%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Usuario</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Nombre</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Rol</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Estatus</th>
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
                  No hay usuarios {filtro}.
                </td>
              </tr>
            ) : (
              datos.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Usuario */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#003087]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#003087] text-xs font-bold">
                          {(u.usuario ?? "U")[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-800 text-sm font-medium truncate">{u.usuario ?? "—"}</span>
                    </div>
                  </td>
                  {/* Nombre */}
                  <td className="px-6 py-4 text-gray-600 text-sm truncate">
                    {u.nombre || u.apellido
                      ? `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim()
                      : <span className="text-gray-300">—</span>}
                  </td>
                  {/* Rol */}
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ROL_BADGE[u.role]}`}>
                      {ROL_LABEL[u.role]}
                    </span>
                  </td>
                  {/* Estatus */}
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      u.estatus ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-400 border-gray-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.estatus ? "bg-green-500" : "bg-gray-400"}`} />
                      {u.estatus ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  {/* Editar */}
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setUsuarioEditar(u)}
                      className="text-[#003087] hover:text-[#002060] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Editar usuario"
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
        <ModalAgregarUsuario onClose={() => setModalAgregar(false)} onCreated={handleCreated} />
      )}
      {usuarioEditar && (
        <ModalEditarUsuario
          usuario={usuarioEditar}
          onClose={() => setUsuarioEditar(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
