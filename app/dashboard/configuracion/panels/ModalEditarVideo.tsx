"use client";
import { useRef, useState } from "react";
import { editarVideo } from "@/app/actions/videos";
import VideoUploader from "./VideoUploader";

async function uploadVideoDirecto(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ url: string; publicId: string }> {
  const signRes = await fetch("/api/upload/video/sign");
  if (!signRes.ok) throw new Error("Error al obtener firma");
  const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

  const fd = new FormData();
  fd.append("file", file);
  fd.append("signature", signature);
  fd.append("timestamp", String(timestamp));
  fd.append("api_key", apiKey);
  fd.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({ url: res.secure_url, publicId: res.public_id });
      } else {
        reject(new Error("Error al subir video a Cloudinary"));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red"));
    xhr.send(fd);
  });
}

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
  video: Video;
  onClose: () => void;
  onUpdated: (v: Video) => void;
}

export default function ModalEditarVideo({ video, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoCleared, setVideoCleared] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(file: File | null) {
    setVideoFile(file);
    setVideoCleared(file === null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string).trim() || null;
    const descripcion = (fd.get("descripcion") as string).trim() || null;
    const orden = parseInt((fd.get("orden") as string) || "0", 10);
    const estatus = fd.get("estatus") === "true";

    if (videoCleared && !videoFile) {
      setError("El video es obligatorio. Selecciona uno nuevo antes de guardar.");
      return;
    }

    setLoading(true);
    setProgreso(0);
    try {
      let url = video.url;
      let publicId = video.publicId;

      if (videoFile) {
        const data = await uploadVideoDirecto(videoFile, setProgreso);
        url = data.url;
        publicId = data.publicId;
      }

      const actualizado = await editarVideo(
        video.id,
        { nombre, descripcion, url, publicId, orden, estatus },
        video.publicId
      );
      onUpdated(actualizado as Video);
    } catch {
      setError("Error al actualizar. Intenta de nuevo.");
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
          <h2 className="text-[#0d0d0d] font-bold text-lg">Editar video</h2>
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
              defaultValue={video.nombre ?? ""}
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
              defaultValue={video.descripcion ?? ""}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors resize-none"
            />
          </div>

          {/* Orden y Estatus */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">Orden</label>
              <input
                name="orden"
                type="number"
                min={0}
                defaultValue={video.orden}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                Estatus <span className="text-[#C8102E]">*</span>
              </label>
              <select
                name="estatus"
                defaultValue={String(video.estatus)}
                className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Video */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">Video</label>
            <VideoUploader initialUrl={video.url} onFileChange={handleFileChange} />
          </div>

          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <p className="text-[#003087] text-sm">
                  {progreso < 100 ? `Subiendo video… ${progreso}%` : "Procesando video, esto puede tardar unos segundos…"}
                </p>
              </div>
              {progreso < 100 && (
                <div className="w-full bg-blue-200 rounded-full h-1.5">
                  <div
                    className="bg-[#003087] h-1.5 rounded-full transition-all duration-200"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              )}
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
              {loading ? (progreso < 100 ? `Subiendo ${progreso}%` : "Procesando…") : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
