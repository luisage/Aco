"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

const navItems = [
  {
    href: "/dashboard/alumnos",
    label: "Alumnos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/registro",
    label: "Registro",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reportes",
    label: "Reportes",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tienda",
    label: "Tienda",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/configuracion",
    label: "Configuración",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const roleLabel: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  USER: "Usuario",
};

function SidebarInner({
  onClose,
  nombre,
  role,
}: {
  onClose: () => void;
  nombre: string;
  role: string;
}) {
  const pathname = usePathname();

  return (
    /* Imagen de fondo + overlays */
    <div className="relative flex flex-col h-full overflow-hidden">

      {/* Imagen de fondo — boxeador centrado */}
      <Image
        src="/peleador.png"
        alt=""
        fill
        className="object-cover object-center"
        sizes="256px"
        priority
        aria-hidden="true"
      />

      {/* Degradado: 50% arriba, 0% abajo — boxeador totalmente visible en la parte inferior */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#001a44]/50 to-transparent" />

      {/* Línea dorada lateral izquierda */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D4A017]/80 via-[#D4A017]/40 to-transparent" />

      {/* Contenido encima del fondo */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#D4A017]/20">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <Image
              src="/logo.jpeg"
              alt="ACO Doyang"
              width={40}
              height={40}
              className="rounded-full ring-1 ring-[#D4A017]/50"
            />
            <div>
              <p className="text-white font-bold text-sm leading-tight">ACO Doyang</p>
              <p className="text-[#D4A017] text-xs">Panel de control</p>
            </div>
          </Link>
        </div>

        {/* Usuario */}
        <div className="px-5 py-4 border-b border-[#D4A017]/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C8102E] flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0 ring-1 ring-[#D4A017]/40">
            {nombre.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">{nombre}</p>
            <p className="text-[#D4A017]/80 text-xs mt-0.5">{roleLabel[role] ?? role}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#C8102E] text-white shadow-lg shadow-[#C8102E]/30"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Cerrar sesión */}
        <div className="px-3 pb-5 border-t border-[#D4A017]/20 pt-3">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-[#C8102E]/20 hover:text-[#C8102E] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function Sidebar({ nombre, role }: { nombre: string; role: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen flex-shrink-0 border-r border-[#D4A017]/20">
        <SidebarInner onClose={() => {}} nombre={nombre} role={role} />
      </aside>

      {/* Mobile: botón hamburguesa */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="bg-[#001a44]/90 border border-[#D4A017]/30 rounded-xl p-2.5 text-white shadow-lg backdrop-blur-sm"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile: overlay + drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 shadow-2xl border-r border-[#D4A017]/20">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-20 text-white/60 hover:text-white"
              aria-label="Cerrar menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarInner onClose={() => setMobileOpen(false)} nombre={nombre} role={role} />
          </aside>
        </>
      )}
    </>
  );
}
