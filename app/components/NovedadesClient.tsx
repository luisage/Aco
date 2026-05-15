"use client";
import { useEffect, useRef, useState } from "react";

interface Novedad {
  id: number;
  titulo: string;
  descripcion: string;
  vigencia: string | null;
  imagen: string | null;
  publicId: string | null;
}

function getItemsPerPage(): number {
  if (typeof window === "undefined") return 3;
  const w = window.innerWidth;
  if (w >= 1280) return 4;
  if (w >= 1024) return 3;
  if (w >= 640)  return 2;
  return 1;
}

export default function NovedadesClient({ novedades }: { novedades: Novedad[] }) {
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [current, setCurrent]           = useState(0);
  const [modalImagen, setModalImagen]   = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ajustar itemsPerPage según el ancho de pantalla
  useEffect(() => {
    function update() {
      const n = getItemsPerPage();
      setItemsPerPage(n);
      setCurrent((prev) => Math.min(prev, Math.max(0, novedades.length - n)));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [novedades.length]);

  const maxIndex = Math.max(0, novedades.length - itemsPerPage);

  // Auto-avance cada 8 segundos
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [maxIndex]);

  function goTo(idx: number) {
    setCurrent(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 8000);
  }

  const itemWidthPct = 100 / itemsPerPage;
  const translatePct = -(current * itemWidthPct);
  const totalDots    = maxIndex + 1;

  return (
    <section id="novedades" className="bg-[#0a0a0a] py-16 sm:py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-center font-black uppercase"
          style={{ fontSize: 42, color: "#c9a227", letterSpacing: 6, marginBottom: 56 }}
        >
          Novedades
        </h2>

        {/* Track */}
        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(${translatePct}%)`,
              transition: "transform 0.5s ease",
            }}
          >
            {novedades.map((n) => (
              <div
                key={n.id}
                className="flex-shrink-0 px-2.5"
                style={{ width: `${itemWidthPct}%` }}
              >
                <article
                  className="h-full flex flex-col rounded-[20px] p-6"
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c8102e] flex-shrink-0 mt-1.5" />
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-white text-base mb-2 leading-snug">
                        {n.titulo}
                      </h3>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {n.descripcion}
                      </p>

                      {(n.imagen || n.vigencia) && (
                        <div
                          className="mt-3 pt-3 flex items-center justify-between gap-3"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          {/* Ver detalles — solo si tiene imagen */}
                          {n.imagen ? (
                            <button
                              onClick={() => setModalImagen(n.imagen)}
                              className="flex items-center gap-1.5 text-xs font-bold uppercase transition-opacity hover:opacity-70"
                              style={{ color: "#c9a227", letterSpacing: 1.5 }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                              Ver detalles
                            </button>
                          ) : (
                            <span />
                          )}

                          {/* Vigencia */}
                          {n.vigencia && (
                            <p className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: "#c9a227", letterSpacing: 2 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              {n.vigencia}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Navegación */}
        {totalDots > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            {/* Flecha izquierda */}
            <button
              onClick={() => goTo(current === 0 ? maxIndex : current - 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(255,255,255,0.12)" }}
              aria-label="Anterior"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalDots }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:      i === current ? 24 : 10,
                    height:     10,
                    background: i === current ? "#c9a227" : "rgba(255,255,255,0.2)",
                  }}
                  aria-label={`Ir a novedad ${i + 1}`}
                />
              ))}
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => goTo(current >= maxIndex ? 0 : current + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(255,255,255,0.12)" }}
              aria-label="Siguiente"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Modal imagen */}
      {modalImagen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setModalImagen(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImagen(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#c9a227] transition-colors"
              aria-label="Cerrar"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img
              src={modalImagen}
              alt="Detalle de novedad"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
