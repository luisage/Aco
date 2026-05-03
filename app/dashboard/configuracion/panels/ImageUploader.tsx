"use client";
import { useRef, useState } from "react";

interface Props {
  initialUrl?: string | null;
  onFileChange: (file: File | null) => void;
}

export default function ImageUploader({ initialUrl, onFileChange }: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function applyFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileChange(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) applyFile(file);
  }

  function handleRemove() {
    setPreview(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {preview ? (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-44 object-cover rounded-xl border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            aria-label="Quitar imagen"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-44 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors select-none ${
            dragging
              ? "border-[#D4A017] bg-[#D4A017]/5"
              : "border-gray-300 hover:border-[#D4A017] hover:bg-gray-50"
          }`}
        >
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 text-center px-4">
            <span className="hidden sm:inline">Arrastra una imagen aquí o </span>
            <span className="text-[#D4A017] font-medium">selecciona un archivo</span>
          </p>
          <p className="text-xs text-gray-400 sm:hidden text-center px-4">
            Toma una foto o elige de tu galería
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
