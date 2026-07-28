"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ModalEditarAlumno from "./ModalEditarAlumno";
import ModalRegistrarPago from "./ModalRegistrarPago";
import ModalModificarEstatus from "./ModalModificarEstatus";
import { registrarAsistencia, quitarAsistencia } from "@/app/actions/asistencias";

type EstadoAlumno = "ACTIVO" | "INACTIVO" | "BAJA";
type EstadoPago = "AL_CORRIENTE" | "ATRASADO" | "ADEUDO" | "A_PAGAR";

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  fechaInscripcion: string;
  telefono: string | null;
  estado: EstadoAlumno;
  tieneAsistenciaHoy: boolean;
  estadoPago: EstadoPago;
}

const PAGO_BADGE: Record<EstadoPago, { cls: string; label: string }> = {
  AL_CORRIENTE: { cls: "bg-green-100 text-green-700 border-green-300",   label: "Al corriente" },
  ATRASADO:     { cls: "bg-yellow-100 text-yellow-700 border-yellow-300", label: "Atraso"       },
  ADEUDO:       { cls: "bg-red-100 text-red-600 border-red-300",          label: "Adeudo"       },
  A_PAGAR:      { cls: "bg-orange-100 text-orange-700 border-orange-300", label: "A pagar"      },
};

const PAGO_DOT: Record<EstadoPago, string> = {
  AL_CORRIENTE: "bg-green-500",
  ATRASADO:     "bg-yellow-500",
  ADEUDO:       "bg-red-500",
  A_PAGAR:      "bg-orange-500",
};

const ESTADO_OPTS: { value: EstadoAlumno; label: string }[] = [
  { value: "ACTIVO", label: "Activos" },
  { value: "INACTIVO", label: "Inactivos" },
  { value: "BAJA", label: "Baja" },
];

const ESTADO_BADGE: Record<EstadoAlumno, string> = {
  ACTIVO:   "bg-green-100 text-green-700 border-green-300",
  INACTIVO: "bg-gray-100 text-gray-500 border-gray-200",
  BAJA:     "bg-red-100 text-red-600 border-red-300",
};

function calcularEdad(fechaIso: string): number {
  const hoy = new Date();
  const nac = new Date(fechaIso);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function formatFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MenuTresPuntos({ alumnoId, onEditar, onEstatus, onPago }: { alumnoId: number; onEditar: (id: number) => void; onEstatus: (id: number) => void; onPago: (id: number) => void }) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function cerrar(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setAbierto(false);
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [abierto]);

  function handleOpen() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setAbierto((v) => !v);
  }

  return (
    <div className="flex justify-end">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="Opciones"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5"  r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {abierto && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden"
        >
          <button
            onClick={() => { setAbierto(false); onEditar(alumnoId); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4 text-[#003087]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button
            onClick={() => { setAbierto(false); onEstatus(alumnoId); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Modificar estatus
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => { setAbierto(false); onPago(alumnoId); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Registrar pago
          </button>
        </div>
      )}
    </div>
  );
}

export default function AlumnosClient() {
  const [estado, setEstado] = useState<EstadoAlumno>("ACTIVO");
  const [busqueda, setBusqueda] = useState("");
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [alumnoEditarId, setAlumnoEditarId] = useState<number | null>(null);
  const [alumnoEstatusId, setAlumnoEstatusId] = useState<number | null>(null);
  const [alumnoPagoId, setAlumnoPagoId] = useState<number | null>(null);
  const [registrando, setRegistrando] = useState<Set<number>>(new Set());

  async function handleAsistencia(alumnoId: number, tieneAsistencia: boolean) {
    setRegistrando((prev) => new Set(prev).add(alumnoId));
    setAlumnos((prev) =>
      prev.map((a) => a.id === alumnoId ? { ...a, tieneAsistenciaHoy: !tieneAsistencia } : a)
    );
    try {
      if (tieneAsistencia) {
        await quitarAsistencia(alumnoId);
      } else {
        await registrarAsistencia(alumnoId);
      }
    } catch {
      // Revertir si falla
      setAlumnos((prev) =>
        prev.map((a) => a.id === alumnoId ? { ...a, tieneAsistenciaHoy: tieneAsistencia } : a)
      );
    } finally {
      setRegistrando((prev) => { const s = new Set(prev); s.delete(alumnoId); return s; });
    }
  }

  const fetchAlumnos = useCallback(async (est: EstadoAlumno, q: string) => {
    setCargando(true);
    try {
      const params = new URLSearchParams({ estado: est, q });
      const res = await fetch(`/api/alumnos?${params}`);
      const json = await res.json();
      setAlumnos(Array.isArray(json) ? json : []);
    } finally {
      setCargando(false);
    }
  }, []);

  // Debounce búsqueda + reacción al filtro
  useEffect(() => {
    const t = setTimeout(() => fetchAlumnos(estado, busqueda), 300);
    return () => clearTimeout(t);
  }, [estado, busqueda, fetchAlumnos]);

  const estadoLabel = ESTADO_OPTS.find((o) => o.value === estado)?.label ?? "";

  return (
    <>
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-blue-100 border-b border-blue-200">
        <div>
          <h2 className="text-[#0d0d0d] font-bold text-lg">Alumnos</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {cargando ? "Cargando…" : `${alumnos.length} alumno${alumnos.length !== 1 ? "s" : ""} ${estadoLabel.toLowerCase()}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Búsqueda */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o teléfono…"
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl pl-9 pr-4 py-2.5 w-full sm:w-64 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filtro estado */}
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoAlumno)}
            className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 cursor-pointer appearance-none pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "16px",
            }}
          >
            {ESTADO_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista mobile */}
      <div className="sm:hidden bg-gray-200">
        {cargando ? (
          <div className="px-6 py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : alumnos.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            {busqueda
              ? `Sin resultados para "${busqueda}".`
              : `No hay alumnos ${estadoLabel.toLowerCase()}.`}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {alumnos.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => handleAsistencia(a.id, a.tieneAsistenciaHoy)}
                  disabled={registrando.has(a.id)}
                  title={a.tieneAsistenciaHoy ? "Quitar asistencia" : "Registrar asistencia"}
                  className={`shrink-0 w-4 h-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait ${
                    a.tieneAsistenciaHoy ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{a.apellido}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${PAGO_BADGE[a.estadoPago].cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${PAGO_DOT[a.estadoPago]}`} />
                  {PAGO_BADGE[a.estadoPago].label}
                </span>
                <MenuTresPuntos alumnoId={a.id} onEditar={setAlumnoEditarId} onEstatus={setAlumnoEstatusId} onPago={setAlumnoPagoId} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabla */}
      <div className="hidden sm:block overflow-x-auto bg-gray-200">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: "4%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "9%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-300">
              <th className="px-4 py-3.5" />
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Nombre</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Apellido</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">Edad</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden sm:table-cell">Fecha registro</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden md:table-cell">Estado</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#D4A017] uppercase tracking-wider hidden md:table-cell">Pago</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : alumnos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                  {busqueda
                    ? `Sin resultados para "${busqueda}".`
                    : `No hay alumnos ${estadoLabel.toLowerCase()}.`}
                </td>
              </tr>
            ) : (
              alumnos.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Asistencia */}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleAsistencia(a.id, a.tieneAsistenciaHoy)}
                      disabled={registrando.has(a.id)}
                      title={a.tieneAsistenciaHoy ? "Quitar asistencia" : "Registrar asistencia"}
                      className={`w-4 h-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait ${
                        a.tieneAsistenciaHoy ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  </td>
                  {/* Nombre */}
                  <td className="px-6 py-4 text-gray-800 text-sm font-medium truncate">{a.nombre}</td>
                  {/* Apellido */}
                  <td className="px-6 py-4 text-gray-700 text-sm truncate">{a.apellido}</td>
                  {/* Edad */}
                  <td className="px-4 py-4 text-center text-gray-700 text-sm">
                    {calcularEdad(a.fechaNacimiento)}
                  </td>
                  {/* Fecha inscripción */}
                  <td className="px-6 py-4 text-gray-600 text-sm hidden sm:table-cell">
                    {formatFecha(a.fechaInscripcion)}
                  </td>
                  {/* Estado */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${ESTADO_BADGE[a.estado]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        a.estado === "ACTIVO" ? "bg-green-500" : a.estado === "BAJA" ? "bg-red-500" : "bg-gray-400"
                      }`} />
                      {a.estado === "ACTIVO" ? "Activo" : a.estado === "INACTIVO" ? "Inactivo" : "Baja"}
                    </span>
                  </td>
                  {/* Pago */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${PAGO_BADGE[a.estadoPago].cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${PAGO_DOT[a.estadoPago]}`} />
                      {PAGO_BADGE[a.estadoPago].label}
                    </span>
                  </td>
                  {/* Menú */}
                  <td className="px-4 py-4">
                    <MenuTresPuntos alumnoId={a.id} onEditar={setAlumnoEditarId} onEstatus={setAlumnoEstatusId} onPago={setAlumnoPagoId} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {alumnoEditarId !== null && (
      <ModalEditarAlumno
        alumnoId={alumnoEditarId}
        onClose={() => setAlumnoEditarId(null)}
        onActualizado={() => {
          setAlumnoEditarId(null);
          fetchAlumnos(estado, busqueda);
        }}
      />
    )}

    {alumnoEstatusId !== null && (() => {
      const alumno = alumnos.find((a) => a.id === alumnoEstatusId);
      if (!alumno) return null;
      return (
        <ModalModificarEstatus
          alumnoId={alumno.id}
          alumnoNombre={`${alumno.nombre} ${alumno.apellido}`}
          estatusActual={alumno.estado}
          onClose={() => setAlumnoEstatusId(null)}
          onActualizado={() => {
            setAlumnoEstatusId(null);
            fetchAlumnos(estado, busqueda);
          }}
        />
      );
    })()}

    {alumnoPagoId !== null && (
      <ModalRegistrarPago
        alumnoId={alumnoPagoId}
        onClose={() => setAlumnoPagoId(null)}
        onPagoRegistrado={() => {
          setAlumnoPagoId(null);
          fetchAlumnos(estado, busqueda);
        }}
      />
    )}
    </>
  );
}
