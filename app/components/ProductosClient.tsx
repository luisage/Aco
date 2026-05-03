"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string | null;
  costo: number;
  categoria: string;
}

function formatPrecio(costo: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(costo);
}

function getItemsPerPage(): number {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w >= 1280) return 5;
  if (w >= 1024) return 4;
  if (w >= 640)  return 3;
  return 2;
}

export default function ProductosClient({ productos }: { productos: Producto[] }) {
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [current, setCurrent]           = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function update() {
      const n = getItemsPerPage();
      setItemsPerPage(n);
      setCurrent((prev) => Math.min(prev, Math.max(0, productos.length - n)));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [productos.length]);

  const maxIndex = Math.max(0, productos.length - itemsPerPage);

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
    <section id="productos" className="bg-[#0a0a0a] py-16 sm:py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-center font-black uppercase"
          style={{ fontSize: 42, color: "#c9a227", letterSpacing: 6, marginBottom: 56 }}
        >
          Equipo en Venta
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
            {productos.map((p) => (
              <div
                key={p.id}
                className="flex-shrink-0 px-2.5"
                style={{ width: `${itemWidthPct}%` }}
              >
                <div
                  className="rounded-[20px] overflow-hidden hover:-translate-y-1 transition-all duration-[250ms]"
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="relative aspect-square" style={{ background: "#1a1a1a" }}>
                    {p.imagen ? (
                      <Image
                        src={p.imagen}
                        alt={p.nombre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl" style={{ color: "rgba(255,255,255,0.15)" }}>
                        🥊
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2" style={{ color: "#fff" }}>
                      {p.nombre}
                    </h3>
                    <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {p.descripcion}
                    </p>
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                    <p className="font-extrabold text-base sm:text-lg" style={{ color: "#c8102e" }}>
                      {formatPrecio(p.costo)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navegación */}
        {totalDots > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
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
                  aria-label={`Ir a producto ${i + 1}`}
                />
              ))}
            </div>

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
    </section>
  );
}
