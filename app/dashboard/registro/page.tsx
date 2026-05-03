import RegistroAlumnoForm from "./RegistroAlumnoForm";

export default function RegistroPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Registro de Alumnos</h1>
      <p className="text-gray-500 text-sm mb-6">Completa el formulario para dar de alta a un nuevo alumno</p>
      <RegistroAlumnoForm />
    </div>
  );
}
