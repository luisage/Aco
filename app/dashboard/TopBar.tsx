export default function TopBar({
  nombre,
  role,
}: {
  nombre: string;
  role: string;
}) {
  const roleLabel: Record<string, string> = {
    SUPERADMIN: "Super Admin",
    ADMIN: "Administrador",
    USER: "Usuario",
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-30 lg:pl-8">
      <div className="lg:hidden w-10" /> {/* espacio para el botón móvil */}

      <div className="flex-1" />

      {/* Usuario */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{nombre}</p>
          <p className="text-xs text-gray-500">{roleLabel[role] ?? role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#C8102E] flex items-center justify-center text-white font-bold text-sm uppercase">
          {nombre.charAt(0)}
        </div>
      </div>
    </header>
  );
}
