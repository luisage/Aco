"use client";
import { useRef, useState } from "react";
import { crearVideo } from "@/app/actions/videos";
import VideoUploader from "./VideoUploader";

interface Video {
  id: number;
  nombre: string | null;
  descripcion: string | null;
  url: string;
  publicId: string;
  estatus: boolean;
  orden: number;
}

interface Props {
  onClose: () => void;
  onCreated: (v: Video) => void;
}

export default function ModalAgregarVideo({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!videoFile) { setError("Debes seleccionar un video."); return; }

    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string).trim() || null;
    const descripcion = (fd.get("descripcion") as string).trim() || null;
    const orden = parseInt((fd.get("orden") as string) || "0", 10);

    setLoading(true);
    try {
      const uploadFd = new FormData();
      uploadFd.append("file", videoFile);
      const res = await fetch("/api/upload/video", { method: "POST", body: uploadFd });
      if (!res.ok) throw new Error("Error al subir video");
      const { url, publicId } = await res.json();

      const nuevo = await crearVideo({ nombre, descripcion, url, publicId, orden });
      onCreated(nuevo as Video);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-200 border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-blue-100 border-b border-blue-200 rounded-t-2xl flex-shrink-0">
          <h2 className="text-[#0d0d0d] font-bold text-lg">Nuevo video</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-6 space-y-4 overflow-y-auto">
          {/* Nombre */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Nombre <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              name="nombre"
              type="text"
              maxLength={150}
              placeholder="Ej. Combate final torneo 2024"
              autoFocus
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              name="descripcion"
              rows={2}
              placeholder="Breve descripción del video..."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors resize-none"
            />
          </div>

          {/* Orden */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Orden <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              name="orden"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
            />
          </div>

          {/* Video */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Video <span className="text-[#C8102E]">*</span>
            </label>
            <VideoUploader onFileChange={setVideoFile} />
          </div>

          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="text-[#003087] text-sm">Subiendo y optimizando video, esto puede tardar unos segundos…</p>
            </div>
          )}

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
              {loading ? "Subiendo..." : "Aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
