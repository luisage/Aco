-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('TORNEO', 'EXAMEN', 'SEMINARIO', 'EXHIBICION', 'GRADUACION', 'CAMPAMENTO', 'OTRO');

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoEvento" "TipoEvento" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT,
    "estado" TEXT,
    "ciudad" TEXT,
    "ubicacion" TEXT,
    "descripcion" TEXT,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumnoEvento" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "categoria" TEXT,
    "resultado" TEXT,
    "confirmado" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "inscritoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlumnoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlumnoEvento_alumnoId_eventoId_key" ON "AlumnoEvento"("alumnoId", "eventoId");

-- AddForeignKey
ALTER TABLE "AlumnoEvento" ADD CONSTRAINT "AlumnoEvento_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "alumnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumnoEvento" ADD CONSTRAINT "AlumnoEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
