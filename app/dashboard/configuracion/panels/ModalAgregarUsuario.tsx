"use client";
import { useRef, useState } from "react";
import { crearUsuario } from "@/app/actions/usuarios";

type Role = "SUPERADMIN" | "ADMIN" | "USER";

interface Usuario {
  id: number;
  usuario: string | null;
  nombre: string | null;
  apellido: string | null;
  role: Role;
  estatus: boolean;
}

interface Props {
  onClose: () => void;
  onCreated: (u: Usuario) => void;
}

function EyeButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
      {visible ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}

export default function ModalAgregarUsuario({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passVisible, setPassVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const usuario = (fd.get("usuario") as string).trim();
    const nombre = (fd.get("nombre") as string).trim() || null;
    const apellido = (fd.get("apellido") as string).trim() || null;
    const password = fd.get("password") as string;
    const role = fd.get("role") as Role;

    if (!usuario || !password || !role) { setError("Usuario, contraseña y rol son obligatorios."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }

    setLoading(true);
    try {
      const nuevo = await crearUsuario({ usuario, nombre, apellido, password, role });
      onCreated(nuevo as unknown as Usuario);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("Unique") || msg.includes("unique") ? "Ese nombre de usuario ya existe." : "Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl">
          <h2 className="text-[#0d0d0d] font-bold text-lg">Nuevo usuario</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                Nombre <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input name="nombre" type="text" maxLength={100} placeholder="Juan"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                Apellido <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input name="apellido" type="text" maxLength={100} placeholder="Pérez"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors" />
            </div>
          </div>

          {/* Usuario */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Usuario <span className="text-[#C8102E]">*</span>
            </label>
            <input name="usuario" type="text" required maxLength={50} placeholder="nombre_usuario" autoFocus
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors" />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Contraseña <span className="text-[#C8102E]">*</span>
            </label>
            <div className="relative">
              <input name="password" type={passVisible ? "text" : "password"} required placeholder="Mínimo 6 caracteres"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors" />
              <EyeButton visible={passVisible} onClick={() => setPassVisible(v => !v)} />
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Rol <span className="text-[#C8102E]">*</span>
            </label>
            <select name="role" required defaultValue="ADMIN"
              className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer">
              <option value="SUPERADMIN">Superadmin</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">Usuario</option>
            </select>
          </div>

          {error && (
            <p className="text-[#C8102E] text-sm bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? "Guardando..." : "Aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
