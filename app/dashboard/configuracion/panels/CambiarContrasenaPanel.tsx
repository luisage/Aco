"use client";
import { useRef, useState } from "react";
import { cambiarContrasena } from "@/app/actions/cuenta";

function PasswordField({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1.5">
        {label} {required && <span className="text-[#C8102E]">*</span>}
      </label>
      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
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
      </div>
    </div>
  );
}

export default function CambiarContrasenaPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const actual = fd.get("actual") as string;
    const nueva = fd.get("nueva") as string;
    const confirmar = fd.get("confirmar") as string;

    if (!actual || !nueva || !confirmar) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (nueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (nueva !== confirmar) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const result = await cambiarContrasena(actual, nueva);
      if (!result.ok) {
        setError(result.error ?? "Error al actualizar.");
      } else {
        setSuccess(true);
        formRef.current?.reset();
      }
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancelar() {
    setError("");
    setSuccess(false);
    formRef.current?.reset();
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 bg-blue-100 border-b border-blue-200">
        <h2 className="text-[#0d0d0d] font-bold text-lg">Modificar contraseña</h2>
        <p className="text-gray-500 text-sm mt-0.5">Actualiza la contraseña de tu cuenta de administrador</p>
      </div>

      {/* Formulario */}
      <div className="bg-gray-200 px-6 py-8">
        <form ref={formRef} onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          <PasswordField
            name="actual"
            label="Contraseña actual"
            placeholder="Ingresa tu contraseña actual"
            required
          />
          <PasswordField
            name="nueva"
            label="Nueva contraseña"
            placeholder="Mínimo 6 caracteres"
            required
          />
          <PasswordField
            name="confirmar"
            label="Confirmar nueva contraseña"
            placeholder="Repite la nueva contraseña"
            required
          />

          {error && (
            <p className="text-[#C8102E] text-sm bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-700 text-sm bg-green-100 border border-green-300 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contraseña actualizada correctamente.
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleCancelar}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
