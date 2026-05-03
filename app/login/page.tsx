import LoginForm from "./LoginForm";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 relative">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C8102E]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#003087]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4A017]/5 blur-3xl" />
      </div>

      {/* Botón regresar al home */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] text-base font-medium transition-colors group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Regresar al inicio
        </Link>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo y nombre */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.jpeg"
            alt="ACO Doyang"
            width={80}
            height={80}
            className="rounded-full ring-2 ring-[#D4A017]/50 mb-4"
          />
          <h1 className="text-white text-2xl font-extrabold tracking-wide">
            ACO <span className="text-[#D4A017]">Doyang</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        {/* Tarjeta */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <h2 className="text-white font-bold text-xl mb-6 text-center">
            Iniciar sesión
          </h2>
          <LoginForm />
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} ACO Doyang · Taekwondo & Kickboxing
        </p>
      </div>
    </div>
  );
}
