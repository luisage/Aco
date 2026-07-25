-- AlterTable
ALTER TABLE "AlumnoEvento" ADD COLUMN     "grado" TEXT;

-- AlterTable
ALTER TABLE "alumnos" ADD COLUMN     "grado" TEXT;

-- CreateTable
CREATE TABLE "grados" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estatus" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grados_pkey" PRIMARY KEY ("id")
);
