"use client";
import { useRef, useState } from "react";
import { crearImagenCarrusel } from "@/app/actions/imagenCarrusel";
import ImageUploader from "./ImageUploader";

interface ImagenCarrusel {
  id: number;
  nombre: string | null;
  url: string;
  publicId: string | null;
  estatus: boolean;
}

interface Props {
  onClose: () => void;
  onCreated: (img: ImagenCarrusel) => void;
}

export default function ModalAgregarImagenCarrusel({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!imageFile) {
      setError("Debes seleccionar una imagen.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string).trim() || null;

    setLoading(true);
    try {
      const uploadFd = new FormData();
      uploadFd.append("file", imageFile);
      const res = await fetch("/api/upload", { method: "POST", body: uploadFd });
      if (!res.ok) throw new Error("Error al subir imagen");
      const { url, publicId } = await res.json();

      const nueva = await crearImagenCarrusel({ nombre, url, publicId });
      onCreated(nueva as ImagenCarrusel);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl">
          <h2 className="text-[#0d0d0d] font-bold text-lg">Nueva imagen de carrusel</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Nombre <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              name="nombre"
              type="text"
              maxLength={100}
              placeholder="Ej. Banner principal"
              autoFocus
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Imagen <span className="text-[#C8102E]">*</span>
            </label>
            <ImageUploader onFileChange={setImageFile} />
          </div>

          {error && (
            <p className="text-[#C8102E] text-sm bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? "Guardando..." : "Aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
