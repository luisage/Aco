import { getSession } from "@/lib/session";
import ConfiguracionClient from "./ConfiguracionClient";

export default async function ConfiguracionPage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Configuración</h1>
      <p className="text-gray-500 text-sm mb-6">Gestiona el contenido del sistema</p>
      <ConfiguracionClient role={session?.role ?? ""} />
    </div>
  );
}
