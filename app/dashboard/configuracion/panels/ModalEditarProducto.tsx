"use client";
import { useEffect, useRef, useState } from "react";
import { editarProducto } from "@/app/actions/productos";
import ImageUploader from "./ImageUploader";

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

interface Categoria {
  id: number;
  nombre: string;
}

interface Props {
  producto: Producto;
  onClose: () => void;
  onUpdated: (p: Producto) => void;
  role: string;
}

export default function ModalEditarProducto({ producto, onClose, onUpdated, role }: Props) {
  const puedeEditarInventario = role === "SUPERADMIN" || role === "ADMIN";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(producto.categoria);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCleared, setImageCleared] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/categorias?estatus=true")
      .then((r) => r.json())
      .then(setCategorias)
      .catch(() => {});
  }, []);

  function handleFileChange(file: File | null) {
    setImageFile(file);
    if (file === null) setImageCleared(true);
    else setImageCleared(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string).trim();
    const descripcion = (fd.get("descripcion") as string).trim();
    const descripcionVenta = (fd.get("descripcionVenta") as string).trim() || null;
    const costoStr = (fd.get("costo") as string).trim();
    const cantidadStr = (fd.get("cantidad") as string).trim();
    const categoria = categoriaSeleccionada.trim();
    const estatus = fd.get("estatus") === "true";

    if (!nombre || !descripcion || !costoStr || !cantidadStr || !categoria) {
      setError("Todos los campos marcados con * son obligatorios.");
      return;
    }
    const costo = parseInt(costoStr, 10);
    if (isNaN(costo) || costo < 0) { setError("El costo debe ser un número válido."); return; }
    const cantidad = parseInt(cantidadStr, 10);
    if (isNaN(cantidad) || cantidad < 0) { setError("La cantidad debe ser un número válido."); return; }

    setLoading(true);
    try {
      let imagenUrl: string | null = producto.imagen;
      let imagenPublicId: string | null = producto.publicId;

      if (imageFile) {
        const uploadFd = new FormData();
        uploadFd.append("file", imageFile);
        const res = await fetch("/api/upload", { method: "POST", body: uploadFd });
        if (!res.ok) throw new Error("Error al subir imagen");
        const data = await res.json();
        imagenUrl = data.url;
        imagenPublicId = data.publicId;
      } else if (imageCleared) {
        imagenUrl = null;
        imagenPublicId = null;
      }

      const actualizado = await editarProducto(
        producto.id,
        { nombre, descripcion, descripcionVenta, cantidad, costo, categoria, imagen: imagenUrl, publicId: imagenPublicId, estatus },
        producto.publicId
      );
      onUpdated({ ...actualizado, costo: Number(actualizado.costo) });
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
          <h2 className="text-[#0d0d0d] font-bold text-lg">Editar producto</h2>
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
              Nombre <span className="text-[#C8102E]">*</span>
            </label>
            <input
              name="nombre"
              type="text"
              required
              maxLength={200}
              defaultValue={producto.nombre}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Descripción <span className="text-[#C8102E]">*</span>
            </label>
            <textarea
              name="descripcion"
              required
              rows={3}
              defaultValue={producto.descripcion}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors resize-none"
            />
          </div>

          {/* Descripción de venta */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Descripción de venta <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              name="descripcionVenta"
              rows={2}
              defaultValue={producto.descripcionVenta ?? ""}
              placeholder="Descripción breve para mostrar al cliente..."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors resize-none"
            />
          </div>

          {/* Costo y Cantidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                Costo ($) <span className="text-[#C8102E]">*</span>
              </label>
              <input
                name="costo"
                type="number"
                required
                min={0}
                defaultValue={producto.costo}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                Cantidad <span className="text-[#C8102E]">*</span>
              </label>
              {puedeEditarInventario ? (
                <input
                  name="cantidad"
                  type="number"
                  required
                  min={0}
                  defaultValue={producto.cantidad}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
                />
              ) : (
                <>
                  <input type="hidden" name="cantidad" value={producto.cantidad} />
                  <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-400 text-sm flex items-center justify-between">
                    <span>{producto.cantidad}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Categoría <span className="text-[#C8102E]">*</span>
            </label>
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              required
              className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
            >
              {!categorias.some((c) => c.nombre === categoriaSeleccionada) && (
                <option value={categoriaSeleccionada}>{categoriaSeleccionada}</option>
              )}
              {categorias.map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Estatus */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Estatus <span className="text-[#C8102E]">*</span>
            </label>
            <select
              name="estatus"
              defaultValue={String(producto.estatus)}
              className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors cursor-pointer"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Imagen <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <ImageUploader
              initialUrl={producto.imagen}
              onFileChange={handleFileChange}
            />
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
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
