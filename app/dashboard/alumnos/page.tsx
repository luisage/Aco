import AlumnosClient from "./AlumnosClient";

export default function AlumnosPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Alumnos</h1>
      <p className="text-gray-500 text-sm mb-6">Gestión de alumnos inscritos</p>
      <AlumnosClient />
    </div>
  );
}
