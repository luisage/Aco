"use client";
import { useEffect, useRef, useState } from "react";

interface Resena {
  id: number;
  calificacion: number;
  comentario: string;
  creadoEn: Date;
}

function Estrellas({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-lg ${i <= n ? "text-[#D4A017]" : "text-gray-600"}`}>★</span>
      ))}
    </div>
  );
}

function getItemsPerPage(): number {
  if (typeof window === "undefined") return 3;
  const w = window.innerWidth;
  if (w >= 1024) return 3;
  if (w >= 640)  return 2;
  return 1;
}

export default function ResenasClient({ resenas }: { resenas: Resena[] }) {
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [current, setCurrent]           = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function update() {
      const n = getItemsPerPage();
      setItemsPerPage(n);
      setCurrent((prev) => Math.min(prev, Math.max(0, resenas.length - n)));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [resenas.length]);

  const maxIndex = Math.max(0, resenas.length - itemsPerPage);

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
    <div className="mb-4">
      {/* Track */}
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(${translatePct}%)`,
            transition: "transform 0.5s ease",
          }}
        >
          {resenas.map((r) => (
            <div
              key={r.id}
              className="flex-shrink-0 px-2.5"
              style={{ width: `${itemWidthPct}%` }}
            >
              <div
                className="flex flex-col rounded-2xl p-6 h-full"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Estrellas n={r.calificacion} />
                <p className="text-gray-300 text-sm mt-3 leading-relaxed line-clamp-5 flex-1">
                  &ldquo;{r.comentario}&rdquo;
                </p>
                <div className="border-t border-white/10 mt-4 pt-3 flex justify-end">
                  <p className="text-gray-500 text-xs">
                    {new Date(r.creadoEn).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
                aria-label={`Ir a reseña ${i + 1}`}
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
  );
}
