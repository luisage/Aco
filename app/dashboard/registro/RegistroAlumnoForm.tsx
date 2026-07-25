"use client";
import { useEffect, useRef, useState } from "react";
import { registrarAlumno, type RegistroAlumnoData } from "@/app/actions/alumnos";

type EstadoAlumno = "ACTIVO" | "INACTIVO" | "BAJA";
type RolTutor = "MADRE" | "PADRE" | "TUTOR";
type TipoExpectativa =
  | "SOCIALIZAR" | "TRABAJO_EN_EQUIPO" | "COMPETENCIA_FORMAL"
  | "DESARROLLO_FISICO" | "CONTROL_DE_PESO" | "AUTOCONTROL"
  | "DISCIPLINA_Y_RESPETO" | "MEJORAR_CONDUCTA"
  | "ALEJARLO_DE_DISPOSITIVOS" | "APRENDER_A_DEFENDERSE";

interface TutorState {
  rol: RolTutor;
  nombre: string;
  apellidos: string;
  edad: string;
  ocupacion: string;
  telefono: string;
}

interface PersonaState {
  nombreCompleto: string;
  telefono: string;
}

const EXPECTATIVA_LABELS: Record<TipoExpectativa, string> = {
  SOCIALIZAR: "Socializar",
  TRABAJO_EN_EQUIPO: "Trabajo en equipo",
  COMPETENCIA_FORMAL: "Competencia formal",
  DESARROLLO_FISICO: "Desarrollo físico",
  CONTROL_DE_PESO: "Control de peso",
  AUTOCONTROL: "Autocontrol",
  DISCIPLINA_Y_RESPETO: "Disciplina y respeto",
  MEJORAR_CONDUCTA: "Mejorar conducta",
  ALEJARLO_DE_DISPOSITIVOS: "Alejarlo de dispositivos",
  APRENDER_A_DEFENDERSE: "Aprender a defenderse",
};

const TODAS_EXPECTATIVAS = Object.keys(EXPECTATIVA_LABELS) as TipoExpectativa[];

const today = new Date().toISOString().split("T")[0];

const inputClass =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors";
const labelClass = "block text-gray-700 text-sm font-medium mb-1.5";

function emptyTutor(): TutorState {
  return { rol: "PADRE", nombre: "", apellidos: "", edad: "", ocupacion: "", telefono: "" };
}

function Required() {
  return <span className="text-[#C8102E]">*</span>;
}
function Optional() {
  return <span className="text-gray-400 font-normal text-xs"> (opcional)</span>;
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-300 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-blue-100 border-b border-blue-200">
        <h3 className="text-[#0d0d0d] font-bold text-base">{title}</h3>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5 bg-gray-200">{children}</div>
    </div>
  );
}

const initialForm = {
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  telefono: "",
  estado: "ACTIVO" as EstadoAlumno,
  grado: "",
  fechaInscripcion: today,
  mensualidad: "",
  diaLimitePago: "5",
  grupoSanguineo: "",
  alergias: "",
  lesionesAnteriores: "",
  padecimientosHereditarios: "",
  usaLentes: false,
  usaOrtodoncia: false,
  usaZapatosOrtopedicos: false,
  nombreSeguro: "",
  numeroSeguro: "",
  nombreMedico: "",
  domicilioMedico: "",
  telefonoMedico: "",
  notasAdicionales: "",
  otrosDeportes: "",
  numerOHermanos: "",
  autorizaFotos: false,
};

export default function RegistroAlumnoForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoUploading, setFotoUploading] = useState(false);
  const fotoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(initialForm);
  const [tutores, setTutores] = useState<TutorState[]>([]);
  const [personas, setPersonas] = useState<PersonaState[]>([]);
  const [expectativas, setExpectativas] = useState<Set<TipoExpectativa>>(new Set());
  const [grados, setGrados] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    fetch("/api/grados")
      .then((r) => r.json())
      .then((d) => setGrados(Array.isArray(d) ? d : []));
  }, []);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadFoto(file: File) {
    setFotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/foto", { method: "POST", body: fd });
      const json = await res.json();
      setFotoUrl(json.url ?? "");
    } finally {
      setFotoUploading(false);
    }
  }

  function toggleExpectativa(tipo: TipoExpectativa) {
    setExpectativas((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  }

  function updateTutor(i: number, field: keyof TutorState, value: string) {
    setTutores((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  }

  function updatePersona(i: number, field: keyof PersonaState, value: string) {
    setPersonas((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function resetForm() {
    setForm(initialForm);
    setTutores([]);
    setPersonas([]);
    setExpectativas(new Set());
    setFotoUrl("");
    setError("");
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError("Nombre y apellido son obligatorios."); return;
    }
    if (!form.fechaNacimiento) {
      setError("La fecha de nacimiento es obligatoria."); return;
    }
    if (!form.mensualidad || isNaN(parseFloat(form.mensualidad))) {
      setError("La mensualidad es obligatoria."); return;
    }
    for (const t of tutores) {
      if (!t.nombre.trim() || !t.apellidos.trim() || !t.telefono.trim()) {
        setError("Todos los tutores deben tener nombre, apellidos y teléfono."); return;
      }
    }
    for (const p of personas) {
      if (!p.nombreCompleto.trim()) {
        setError("Todas las personas autorizadas deben tener nombre completo."); return;
      }
    }

    setLoading(true);
    try {
      const payload: RegistroAlumnoData = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento,
        telefono: form.telefono.trim() || null,
        fotoUrl: fotoUrl || null,
        estado: form.estado,
        grado: form.grado || null,
        fechaInscripcion: form.fechaInscripcion,
        mensualidad: parseFloat(form.mensualidad),
        diaLimitePago: parseInt(form.diaLimitePago) || 5,
        grupoSanguineo: form.grupoSanguineo.trim() || null,
        alergias: form.alergias.trim() || null,
        lesionesAnteriores: form.lesionesAnteriores.trim() || null,
        padecimientosHereditarios: form.padecimientosHereditarios.trim() || null,
        usaLentes: form.usaLentes,
        usaOrtodoncia: form.usaOrtodoncia,
        usaZapatosOrtopedicos: form.usaZapatosOrtopedicos,
        nombreSeguro: form.nombreSeguro.trim() || null,
        numeroSeguro: form.numeroSeguro.trim() || null,
        nombreMedico: form.nombreMedico.trim() || null,
        domicilioMedico: form.domicilioMedico.trim() || null,
        telefonoMedico: form.telefonoMedico.trim() || null,
        notasAdicionales: form.notasAdicionales.trim() || null,
        otrosDeportes: form.otrosDeportes.trim() || null,
        numerOHermanos: form.numerOHermanos ? parseInt(form.numerOHermanos) : null,
        autorizaFotos: form.autorizaFotos,
        tutores: tutores.map((t) => ({
          rol: t.rol,
          nombre: t.nombre.trim(),
          apellidos: t.apellidos.trim(),
          edad: t.edad ? parseInt(t.edad) : null,
          ocupacion: t.ocupacion.trim() || null,
          telefono: t.telefono.trim(),
        })),
        personasAutorizadas: personas.map((p) => ({
          nombreCompleto: p.nombreCompleto.trim(),
          telefono: p.telefono.trim() || null,
        })),
        expectativas: Array.from(expectativas),
      };
      await registrarAlumno(payload);
      setSuccess(true);
    } catch (err: unknown) {
      setError("Error al registrar el alumno. Verifica los datos e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-gray-800 font-bold text-xl mb-2">Alumno registrado</h2>
        <p className="text-gray-500 text-sm mb-6">El alumno fue dado de alta exitosamente en el sistema.</p>
        <button
          onClick={resetForm}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Registrar otro alumno
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── 1. DATOS PERSONALES ── */}
      <SectionCard title="Datos Personales">
        {/* Foto */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <div
            onClick={() => fotoRef.current?.click()}
            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#D4A017] transition-colors"
          >
            {fotoUrl ? (
              <img src={fotoUrl} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-9 h-9 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <input
            ref={fotoRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFoto(f); }}
          />
          <button
            type="button"
            onClick={() => fotoRef.current?.click()}
            disabled={fotoUploading}
            className="text-xs text-[#003087] hover:underline disabled:opacity-50"
          >
            {fotoUploading ? "Subiendo..." : fotoUrl ? "Cambiar foto" : "Agregar foto (opcional)"}
          </button>
          {fotoUrl && (
            <button type="button" onClick={() => setFotoUrl("")} className="text-xs text-red-500 hover:underline">
              Quitar foto
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre <Required /></label>
            <input type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={100} placeholder="Juan" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Apellido <Required /></label>
            <input type="text" value={form.apellido} onChange={(e) => set("apellido", e.target.value)} maxLength={100} placeholder="Pérez" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha de nacimiento <Required /></label>
            <input type="date" value={form.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teléfono <Optional /></label>
            <input type="tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} maxLength={20} placeholder="55 1234 5678" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estado <Required /></label>
            <select value={form.estado} onChange={(e) => set("estado", e.target.value as EstadoAlumno)} className={inputClass}>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Fecha de inscripción <Required /></label>
            <input type="date" value={form.fechaInscripcion} onChange={(e) => set("fechaInscripcion", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Grado <Optional /></label>
            <select value={form.grado} onChange={(e) => set("grado", e.target.value)} className={inputClass}>
              <option value="">Selecciona un grado</option>
              {grados.map((g) => (
                <option key={g.id} value={g.nombre}>{g.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* ── 2. DATOS DE PAGO ── */}
      <SectionCard title="Datos de Pago">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Mensualidad <Required /></label>
            <input type="number" min="0" step="0.01" value={form.mensualidad} onChange={(e) => set("mensualidad", e.target.value)} placeholder="500.00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Día límite de pago <Required /></label>
            <input type="number" min="1" max="31" value={form.diaLimitePago} onChange={(e) => set("diaLimitePago", e.target.value)} className={inputClass} />
          </div>
        </div>
      </SectionCard>

      {/* ── 3. TUTORES ── */}
      <SectionCard title="Tutores / Responsables" subtitle="Padres, madres o tutores legales del alumno">
        <div className="space-y-4">
          {tutores.map((t, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Tutor {i + 1}</span>
                <button
                  type="button"
                  onClick={() => setTutores((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Rol <Required /></label>
                  <select value={t.rol} onChange={(e) => updateTutor(i, "rol", e.target.value)} className={inputClass}>
                    <option value="PADRE">Padre</option>
                    <option value="MADRE">Madre</option>
                    <option value="TUTOR">Tutor</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Nombre <Required /></label>
                  <input type="text" value={t.nombre} onChange={(e) => updateTutor(i, "nombre", e.target.value)} maxLength={100} placeholder="Juan" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Apellidos <Required /></label>
                  <input type="text" value={t.apellidos} onChange={(e) => updateTutor(i, "apellidos", e.target.value)} maxLength={150} placeholder="García López" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Teléfono <Required /></label>
                  <input type="tel" value={t.telefono} onChange={(e) => updateTutor(i, "telefono", e.target.value)} maxLength={20} placeholder="55 1234 5678" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Edad <Optional /></label>
                  <input type="number" min="1" max="120" value={t.edad} onChange={(e) => updateTutor(i, "edad", e.target.value)} placeholder="35" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Ocupación <Optional /></label>
                  <input type="text" value={t.ocupacion} onChange={(e) => updateTutor(i, "ocupacion", e.target.value)} maxLength={100} placeholder="Empleado" className={inputClass} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTutores((prev) => [...prev, emptyTutor()])}
            className="flex items-center gap-2 text-sm text-[#003087] hover:text-[#002060] font-medium border border-[#003087]/30 hover:border-[#003087]/60 rounded-xl px-4 py-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar tutor
          </button>
        </div>
      </SectionCard>

      {/* ── 4. PERSONAS AUTORIZADAS ── */}
      <SectionCard title="Personas Autorizadas a Recoger">
        <div className="space-y-3">
          {personas.map((p, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Persona {i + 1}</span>
                <button
                  type="button"
                  onClick={() => setPersonas((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nombre completo <Required /></label>
                  <input type="text" value={p.nombreCompleto} onChange={(e) => updatePersona(i, "nombreCompleto", e.target.value)} maxLength={150} placeholder="María López" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Teléfono <Optional /></label>
                  <input type="tel" value={p.telefono} onChange={(e) => updatePersona(i, "telefono", e.target.value)} maxLength={20} placeholder="55 9876 5432" className={inputClass} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPersonas((prev) => [...prev, { nombreCompleto: "", telefono: "" }])}
            className="flex items-center gap-2 text-sm text-[#003087] hover:text-[#002060] font-medium border border-[#003087]/30 hover:border-[#003087]/60 rounded-xl px-4 py-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar persona
          </button>
        </div>
      </SectionCard>

      {/* ── 5. DATOS MÉDICOS ── */}
      <SectionCard title="Datos Médicos">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Grupo sanguíneo <Optional /></label>
              <input type="text" value={form.grupoSanguineo} onChange={(e) => set("grupoSanguineo", e.target.value)} maxLength={10} placeholder="A+, O-, AB+…" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Alergias <Optional /></label>
            <textarea value={form.alergias} onChange={(e) => set("alergias", e.target.value)} rows={2} placeholder="Describe alergias conocidas…" className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Lesiones anteriores <Optional /></label>
            <textarea value={form.lesionesAnteriores} onChange={(e) => set("lesionesAnteriores", e.target.value)} rows={2} placeholder="Fracturas, esguinces, cirugías…" className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Padecimientos hereditarios <Optional /></label>
            <textarea value={form.padecimientosHereditarios} onChange={(e) => set("padecimientosHereditarios", e.target.value)} rows={2} placeholder="Diabetes, hipertensión…" className={`${inputClass} resize-none`} />
          </div>
          <div className="flex flex-wrap gap-6 pt-1">
            {(
              [
                { field: "usaLentes" as const, label: "Usa lentes" },
                { field: "usaOrtodoncia" as const, label: "Usa ortodoncia" },
                { field: "usaZapatosOrtopedicos" as const, label: "Usa zapatos ortopédicos" },
              ] as const
            ).map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form[field]}
                  onChange={(e) => set(field, e.target.checked)}
                  className="w-4 h-4 rounded accent-[#D4A017]"
                />
                <span className="text-gray-700 text-sm">{label}</span>
              </label>
            ))}
          </div>

          {/* Seguro médico */}
          <div className="border-t border-gray-300 pt-4">
            <p className="text-gray-600 font-semibold text-sm mb-3">Seguro Médico</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre del seguro <Optional /></label>
                <input type="text" value={form.nombreSeguro} onChange={(e) => set("nombreSeguro", e.target.value)} maxLength={150} placeholder="IMSS, ISSSTE, GNP…" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Número de póliza <Optional /></label>
                <input type="text" value={form.numeroSeguro} onChange={(e) => set("numeroSeguro", e.target.value)} maxLength={100} placeholder="12345678" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Médico particular */}
          <div className="border-t border-gray-300 pt-4">
            <p className="text-gray-600 font-semibold text-sm mb-3">Médico Particular</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre del médico <Optional /></label>
                <input type="text" value={form.nombreMedico} onChange={(e) => set("nombreMedico", e.target.value)} maxLength={150} placeholder="Dr. Juan García" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono del médico <Optional /></label>
                <input type="tel" value={form.telefonoMedico} onChange={(e) => set("telefonoMedico", e.target.value)} maxLength={20} placeholder="55 1234 5678" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Domicilio <Optional /></label>
                <input type="text" value={form.domicilioMedico} onChange={(e) => set("domicilioMedico", e.target.value)} maxLength={250} placeholder="Calle, número, colonia…" className={inputClass} />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 6. EXPECTATIVAS ── */}
      <SectionCard title="Expectativas" subtitle="¿Qué espera lograr el alumno con el entrenamiento?">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
          {TODAS_EXPECTATIVAS.map((tipo) => (
            <label key={tipo} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={expectativas.has(tipo)}
                onChange={() => toggleExpectativa(tipo)}
                className="w-4 h-4 rounded accent-[#D4A017]"
              />
              <span className="text-gray-700 text-sm">{EXPECTATIVA_LABELS[tipo]}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* ── 7. INFORMACIÓN ADICIONAL ── */}
      <SectionCard title="Información Adicional">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Otros deportes <Optional /></label>
              <input type="text" value={form.otrosDeportes} onChange={(e) => set("otrosDeportes", e.target.value)} maxLength={200} placeholder="Fútbol, natación…" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Número de hermanos <Optional /></label>
              <input type="number" min="0" value={form.numerOHermanos} onChange={(e) => set("numerOHermanos", e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notas adicionales <Optional /></label>
            <textarea value={form.notasAdicionales} onChange={(e) => set("notasAdicionales", e.target.value)} rows={3} placeholder="Cualquier información relevante…" className={`${inputClass} resize-none`} />
          </div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.autorizaFotos}
              onChange={(e) => set("autorizaFotos", e.target.checked)}
              className="w-4 h-4 rounded accent-[#D4A017] mt-0.5"
            />
            <div>
              <span className="text-gray-700 text-sm font-medium">Autoriza uso de fotografías</span>
              <p className="text-gray-400 text-xs mt-0.5">
                El tutor autoriza publicar fotos del alumno en redes sociales y material del club.
              </p>
            </div>
          </label>
        </div>
      </SectionCard>

      {error && (
        <p className="text-[#C8102E] text-sm bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex justify-end pb-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Registrando…" : "Registrar alumno"}
        </button>
      </div>
    </form>
  );
}
