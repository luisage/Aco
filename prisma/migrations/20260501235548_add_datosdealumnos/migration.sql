-- CreateEnum
CREATE TYPE "RolTutor" AS ENUM ('MADRE', 'PADRE', 'TUTOR');

-- CreateEnum
CREATE TYPE "TipoExpectativa" AS ENUM ('SOCIALIZAR', 'TRABAJO_EN_EQUIPO', 'COMPETENCIA_FORMAL', 'DESARROLLO_FISICO', 'CONTROL_DE_PESO', 'AUTOCONTROL', 'DISCIPLINA_Y_RESPETO', 'MEJORAR_CONDUCTA', 'ALEJARLO_DE_DISPOSITIVOS', 'APRENDER_A_DEFENDERSE');

-- AlterTable
ALTER TABLE "alumnos" ADD COLUMN     "alergias" TEXT,
ADD COLUMN     "autorizaFotos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "domicilioMedico" TEXT,
ADD COLUMN     "grupoSanguineo" TEXT,
ADD COLUMN     "lesionesAnteriores" TEXT,
ADD COLUMN     "nombreMedico" TEXT,
ADD COLUMN     "nombreSeguro" TEXT,
ADD COLUMN     "notasAdicionales" TEXT,
ADD COLUMN     "numerOHermanos" INTEGER,
ADD COLUMN     "numeroSeguro" TEXT,
ADD COLUMN     "otrosDeportes" TEXT,
ADD COLUMN     "padecimientosHereditarios" TEXT,
ADD COLUMN     "telefonoMedico" TEXT,
ADD COLUMN     "usaLentes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usaOrtodoncia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usaZapatosOrtopedicos" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Tutor" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "rol" "RolTutor" NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "edad" INTEGER,
    "ocupacion" TEXT,
    "telefono" TEXT NOT NULL,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaAutorizada" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "telefono" TEXT,

    CONSTRAINT "PersonaAutorizada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpectativaAlumno" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "tipo" "TipoExpectativa" NOT NULL,

    CONSTRAINT "ExpectativaAlumno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpectativaAlumno_alumnoId_tipo_key" ON "ExpectativaAlumno"("alumnoId", "tipo");

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "alumnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaAutorizada" ADD CONSTRAINT "PersonaAutorizada_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "alumnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectativaAlumno" ADD CONSTRAINT "ExpectativaAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "alumnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
