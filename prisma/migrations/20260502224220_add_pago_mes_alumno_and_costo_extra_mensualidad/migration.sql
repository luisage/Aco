-- CreateTable
CREATE TABLE "costoExtraMensualidad" (
    "id" SERIAL NOT NULL,
    "dias" TEXT NOT NULL,
    "costo" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "costoExtraMensualidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagoMesAlumno" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "mes" TEXT NOT NULL,

    CONSTRAINT "pagoMesAlumno_pkey" PRIMARY KEY ("id")
);
