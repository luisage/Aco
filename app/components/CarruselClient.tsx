"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Imagen {
  id: number;
  url: string;
  nombre: string | null;
}

export default function CarruselClient({ imagenes }: { imagenes: Imagen[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [imagenes.length]);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((c) => (c - 1 + imagenes.length) % imagenes.length);
  const next = () => setCurrent((c) => (c + 1) % imagenes.length);

  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden bg-black">
      {/* Slides */}
      {imagenes.map((img, idx) => (
        <div
          key={img.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={img.url}
            alt={img.nombre ?? "ACO Doyang"}
            fill
            className="object-cover object-top"
            priority={idx === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>
      ))}

      {/* Hero text */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-4 text-center">
        <h1 className="text-white text-3xl sm:text-5xl lg:text-6xl font-extrabold drop-shadow-lg">
          ACO <span className="text-[#D4A017]">Doyang</span>
        </h1>
        <p className="text-white/90 text-base sm:text-xl mt-2 drop-shadow font-medium">
          Taekwondo · Kickboxing · Desde 1993
        </p>
        <a
          href="#info"
          className="mt-6 px-8 py-3 bg-[#C8102E] hover:bg-[#a00d24] text-white font-bold rounded-full text-sm sm:text-base transition-colors shadow-lg"
        >
          Conoce más
        </a>
      </div>

      {/* Prev / Next */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#D4A017] text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors text-lg"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#D4A017] text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors text-lg"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {imagenes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === current
                ? "bg-[#D4A017] scale-125"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
