import { getSession } from "@/lib/session";

export default async function DashboardHome() {
  const session = await getSession();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Bienvenido, <span className="text-[#C8102E]">{session?.nombre ?? session?.usuario}</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Panel de administración — ACO Doyang
        </p>
      </div>

      {/* Tarjetas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Alumnos", icon: "👥", color: "bg-[#003087]", href: "/dashboard/alumnos" },
          { label: "Registro", icon: "📋", color: "bg-[#C8102E]", href: "/dashboard/registro" },
          { label: "Reportes", icon: "📊", color: "bg-[#D4A017]", href: "/dashboard/reportes" },
          { label: "Configuración", icon: "⚙️", color: "bg-gray-700", href: "/dashboard/configuracion" },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl`}>
              {card.icon}
            </div>
            <span className="font-semibold text-gray-800">{card.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
