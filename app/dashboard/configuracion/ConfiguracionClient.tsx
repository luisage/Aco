"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const NovedadesPanel = dynamic(
  () => import("./panels/NovedadesPanel"),
  { loading: () => <PanelLoading /> }
);

const ResenasPanel = dynamic(
  () => import("./panels/ResenasPanel"),
  { loading: () => <PanelLoading /> }
);

const CategoriasPanel = dynamic(
  () => import("./panels/CategoriasPanel"),
  { loading: () => <PanelLoading /> }
);

const ProductosPanel = dynamic(
  () => import("./panels/ProductosPanel"),
  { loading: () => <PanelLoading /> }
);

const ImagenCarruselPanel = dynamic(
  () => import("./panels/ImagenCarruselPanel"),
  { loading: () => <PanelLoading /> }
);

const VideosPanel = dynamic(
  () => import("./panels/VideosPanel"),
  { loading: () => <PanelLoading /> }
);

const CambiarContrasenaPanel = dynamic(
  () => import("./panels/CambiarContrasenaPanel"),
  { loading: () => <PanelLoading /> }
);

const UsuariosPanel = dynamic(
  () => import("./panels/UsuariosPanel"),
  { loading: () => <PanelLoading /> }
);

const EventosPanel = dynamic(
  () => import("./panels/EventosPanel"),
  { loading: () => <PanelLoading /> }
);

const temasBase = [
  { value: "", label: "Selecciona una opción" },
  { value: "novedades", label: "Novedades" },
  { value: "resenas", label: "Reseñas" },
  { value: "categoria-productos", label: "Categoría de productos" },
  { value: "productos", label: "Productos" },
  { value: "imagen-carrusel", label: "Imagen carrusel" },
  { value: "videos", label: "Videos" },
  { value: "editar-contrasena", label: "Modificar contraseña" },
  { value: "eventos",           label: "Eventos"             },
];

function PanelLoading() {
  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-12 flex justify-center">
      <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProximamentePanel({ label }: { label: string }) {
  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-12 flex flex-col items-center justify-center text-center">
      <span className="text-4xl mb-4">🚧</span>
      <h3 className="text-white font-bold text-lg mb-2">{label}</h3>
      <p className="text-gray-500 text-sm">Este módulo estará disponible próximamente.</p>
    </div>
  );
}

export default function ConfiguracionClient({ role }: { role: string }) {
  const [tema, setTema] = useState("");
  const temas = [
    ...temasBase,
    ...(role === "SUPERADMIN" ? [{ value: "agregar-usuario", label: "Agregar usuario" }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Selector de tema */}
      <div className="bg-gray-200 rounded-2xl border border-gray-300 shadow-sm px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="tema" className="text-gray-700 font-semibold text-sm whitespace-nowrap">
            Tema
          </label>
          <select
            id="tema"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="sm:max-w-xs w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer transition-colors"
          >
            {temas.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Panel según selección */}
      {tema === "" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <span className="text-4xl mb-4">⚙️</span>
          <p className="text-gray-400 text-sm">Selecciona un tema para comenzar a configurar.</p>
        </div>
      )}
      {tema === "novedades" && <NovedadesPanel />}
      {tema === "resenas" && <ResenasPanel />}
      {tema === "categoria-productos" && <CategoriasPanel />}
      {tema === "productos" && <ProductosPanel />}
      {tema === "imagen-carrusel" && <ImagenCarruselPanel />}
      {tema === "videos" && <VideosPanel />}
      {tema === "editar-contrasena" && <CambiarContrasenaPanel />}
      {tema === "agregar-usuario" && <UsuariosPanel />}
      {tema === "eventos"         && <EventosPanel />}
    </div>
  );
}
