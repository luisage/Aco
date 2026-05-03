"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type EstadoAlumno = "ACTIVO" | "INACTIVO" | "BAJA";
type RolTutor = "MADRE" | "PADRE" | "TUTOR";
type TipoExpectativa =
  | "SOCIALIZAR" | "TRABAJO_EN_EQUIPO" | "COMPETENCIA_FORMAL"
  | "DESARROLLO_FISICO" | "CONTROL_DE_PESO" | "AUTOCONTROL"
  | "DISCIPLINA_Y_RESPETO" | "MEJORAR_CONDUCTA"
  | "ALEJARLO_DE_DISPOSITIVOS" | "APRENDER_A_DEFENDERSE";

interface TutorInput {
  rol: RolTutor;
  nombre: string;
  apellidos: string;
  edad?: number | null;
  ocupacion?: string | null;
  telefono: string;
}

interface PersonaAutorizadaInput {
  nombreCompleto: string;
  telefono?: string | null;
}

export interface RegistroAlumnoData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono?: string | null;
  fotoUrl?: string | null;
  estado: EstadoAlumno;
  fechaInscripcion: string;
  mensualidad: number;
  diaLimitePago: number;
  grupoSanguineo?: string | null;
  alergias?: string | null;
  lesionesAnteriores?: string | null;
  padecimientosHereditarios?: string | null;
  usaLentes: boolean;
  usaOrtodoncia: boolean;
  usaZapatosOrtopedicos: boolean;
  nombreSeguro?: string | null;
  numeroSeguro?: string | null;
  nombreMedico?: string | null;
  domicilioMedico?: string | null;
  telefonoMedico?: string | null;
  notasAdicionales?: string | null;
  otrosDeportes?: string | null;
  numerOHermanos?: number | null;
  autorizaFotos: boolean;
  tutores: TutorInput[];
  personasAutorizadas: PersonaAutorizadaInput[];
  expectativas: TipoExpectativa[];
}

export async function registrarAlumno(data: RegistroAlumnoData) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const alumno = await prisma.alumno.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      fechaNacimiento: new Date(data.fechaNacimiento),
      telefono: data.telefono ?? null,
      fotoUrl: data.fotoUrl ?? null,
      estado: data.estado,
      fechaInscripcion: new Date(data.fechaInscripcion),
      mensualidad: data.mensualidad,
      diaLimitePago: data.diaLimitePago,
      grupoSanguineo: data.grupoSanguineo ?? null,
      alergias: data.alergias ?? null,
      lesionesAnteriores: data.lesionesAnteriores ?? null,
      padecimientosHereditarios: data.padecimientosHereditarios ?? null,
      usaLentes: data.usaLentes,
      usaOrtodoncia: data.usaOrtodoncia,
      usaZapatosOrtopedicos: data.usaZapatosOrtopedicos,
      nombreSeguro: data.nombreSeguro ?? null,
      numeroSeguro: data.numeroSeguro ?? null,
      nombreMedico: data.nombreMedico ?? null,
      domicilioMedico: data.domicilioMedico ?? null,
      telefonoMedico: data.telefonoMedico ?? null,
      notasAdicionales: data.notasAdicionales ?? null,
      otrosDeportes: data.otrosDeportes ?? null,
      numerOHermanos: data.numerOHermanos ?? null,
      autorizaFotos: data.autorizaFotos,
      tutores: {
        create: data.tutores.map((t) => ({
          rol: t.rol,
          nombre: t.nombre,
          apellidos: t.apellidos,
          edad: t.edad ?? null,
          ocupacion: t.ocupacion ?? null,
          telefono: t.telefono,
        })),
      },
      personasAutorizadas: {
        create: data.personasAutorizadas.map((p) => ({
          nombreCompleto: p.nombreCompleto,
          telefono: p.telefono ?? null,
        })),
      },
      expectativas: {
        create: data.expectativas.map((tipo) => ({ tipo })),
      },
    },
  });
  return { id: alumno.id };
}

export async function editarAlumno(id: number, data: RegistroAlumnoData) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  await prisma.$transaction([
    prisma.tutor.deleteMany({ where: { alumnoId: id } }),
    prisma.personaAutorizada.deleteMany({ where: { alumnoId: id } }),
    prisma.expectativaAlumno.deleteMany({ where: { alumnoId: id } }),
    prisma.alumno.update({
      where: { id },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        fechaNacimiento: new Date(data.fechaNacimiento),
        telefono: data.telefono ?? null,
        fotoUrl: data.fotoUrl ?? null,
        estado: data.estado,
        fechaInscripcion: new Date(data.fechaInscripcion),
        mensualidad: data.mensualidad,
        diaLimitePago: data.diaLimitePago,
        grupoSanguineo: data.grupoSanguineo ?? null,
        alergias: data.alergias ?? null,
        lesionesAnteriores: data.lesionesAnteriores ?? null,
        padecimientosHereditarios: data.padecimientosHereditarios ?? null,
        usaLentes: data.usaLentes,
        usaOrtodoncia: data.usaOrtodoncia,
        usaZapatosOrtopedicos: data.usaZapatosOrtopedicos,
        nombreSeguro: data.nombreSeguro ?? null,
        numeroSeguro: data.numeroSeguro ?? null,
        nombreMedico: data.nombreMedico ?? null,
        domicilioMedico: data.domicilioMedico ?? null,
        telefonoMedico: data.telefonoMedico ?? null,
        notasAdicionales: data.notasAdicionales ?? null,
        otrosDeportes: data.otrosDeportes ?? null,
        numerOHermanos: data.numerOHermanos ?? null,
        autorizaFotos: data.autorizaFotos,
        tutores: {
          create: data.tutores.map((t) => ({
            rol: t.rol,
            nombre: t.nombre,
            apellidos: t.apellidos,
            edad: t.edad ?? null,
            ocupacion: t.ocupacion ?? null,
            telefono: t.telefono,
          })),
        },
        personasAutorizadas: {
          create: data.personasAutorizadas.map((p) => ({
            nombreCompleto: p.nombreCompleto,
            telefono: p.telefono ?? null,
          })),
        },
        expectativas: {
          create: data.expectativas.map((tipo) => ({ tipo })),
        },
      },
    }),
  ]);

  return { id };
}
