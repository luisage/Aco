import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-[#D4A017]/20 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/logo.jpeg"
                alt="ACO Doyang"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="text-white font-bold text-base leading-tight">ACO Doyang</p>
                <p className="text-[#D4A017] text-xs">Desde 1993</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed text-center sm:text-left">
              Formando campeones en cuerpo, mente y espíritu a través del Taekwondo y el Kickboxing.
            </p>
          </div>

          {/* Navegación */}
          <div className="text-center sm:text-left">
            <h4 className="text-[#D4A017] font-semibold text-sm uppercase tracking-wide mb-3">
              Navegación
            </h4>
            <ul className="space-y-2">
              {[
                ["#info", "Nosotros"],
                ["#novedades", "Novedades"],
                ["#videos", "Videos"],
                ["#productos", "Equipo"],
                ["#resenas", "Reseñas"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-[#D4A017] text-sm transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="text-center sm:text-left">
            <h4 className="text-[#D4A017] font-semibold text-sm uppercase tracking-wide mb-3">
              Contacto
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start justify-center sm:justify-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c8102e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <p>Av del Norte No. 64, 3er Piso</p>
                  <p>Tlaminulpa, Atitalaquia, Hgo.</p>
                </div>
              </div>
              <a href="tel:7731836696" className="flex items-center justify-center sm:justify-start gap-2.5 hover:text-[#D4A017] transition-colors">
                <svg className="w-4 h-4 flex-shrink-0 text-[#c8102e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                773 183 6696
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} ACO Doyang — Taekwondo · Kickboxing. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
