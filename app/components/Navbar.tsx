"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#info", label: "Nosotros" },
  { href: "#novedades", label: "Novedades" },
  { href: "#videos", label: "Videos" },
  { href: "#productos", label: "Equipo" },
  { href: "#resenas", label: "Reseñas" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-[#D4A017]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="ACO Doyang"
              width={44}
              height={44}
              className="rounded-full"
            />
            <span className="text-white font-bold text-lg leading-tight hidden sm:block">
              ACO <span className="text-[#D4A017]">Doyang</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-gray-300 hover:text-[#D4A017] text-sm font-medium transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="ml-2 p-2 text-gray-300 hover:text-[#D4A017] transition-colors"
              aria-label="Iniciar sesión"
              title="Iniciar sesión"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            <span className="block w-6 h-0.5 bg-current mb-1.5 transition-all" />
            <span className="block w-6 h-0.5 bg-current mb-1.5 transition-all" />
            <span className="block w-6 h-0.5 bg-current transition-all" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0d0d0d] border-t border-[#D4A017]/20 px-4 pb-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-gray-300 hover:text-[#D4A017] text-sm font-medium border-b border-white/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className="mt-3 flex items-center gap-2 py-3 text-gray-300 hover:text-[#D4A017] text-sm font-medium transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}
