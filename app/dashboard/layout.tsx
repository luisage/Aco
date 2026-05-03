import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Image from "next/image";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex">
      <Sidebar
        nombre={session.nombre ?? session.usuario}
        role={session.role}
      />

      {/* Área principal con imagen de fondo */}
      <div className="flex-1 relative h-screen overflow-hidden bg-gray-100">
        {/* Imagen de fondo — peleador de taekwondo, anclado a la derecha */}
        <Image
          src="/peleador2Grande.png"
          alt=""
          fill
          className="object-cover object-left-bottom"
          sizes="calc(100vw - 256px)"
          aria-hidden="true"
        />
        {/* Degradado izquierda→derecha: 60% opaco a 0% */}
        <div className="absolute inset-0 bg-gradient-to-l from-gray-100/60 to-transparent" />

        <main className="relative z-10 p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
