-- CreateEnum
CREATE TYPE "EstadoResena" AS ENUM ('VISIBLE', 'OCULTA', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "EstadoAlumno" AS ENUM ('ACTIVO', 'INACTIVO', 'BAJA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PAGADO', 'ABONO', 'PENDIENTE', 'VENCIDO');

-- CreateEnum
CREATE TYPE "ResultadoCombate" AS ENUM ('VICTORIA', 'DERROTA', 'EMPATE', 'NO_CONTEST');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "alumnos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "telefono" VARCHAR(20),
    "foto_url" VARCHAR(500),
    "estado" "EstadoAlumno" NOT NULL DEFAULT 'ACTIVO',
    "fecha_inscripcion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mensualidad" DECIMAL(8,2) NOT NULL,
    "dia_limite_pago" INTEGER NOT NULL DEFAULT 5,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "fecha_pago" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" INTEGER NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "mes_correspondiente" VARCHAR(7) NOT NULL,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PAGADO',
    "notas" TEXT,
    "registrado_por" VARCHAR(100),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora_entrada" TIME NOT NULL,
    "hora_salida" TIME,
    "observacion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combates" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "rival" VARCHAR(150),
    "resultado" "ResultadoCombate" NOT NULL,
    "categoria" VARCHAR(50),
    "evento" VARCHAR(200),
    "lugar" VARCHAR(200),
    "notas" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "combates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resenas" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "estado" "EstadoResena" NOT NULL DEFAULT 'PENDIENTE',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "apellido" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Novedades" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "vigencia" TEXT,
    "estatus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Novedades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoriaProducto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estatus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categoriaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagen" TEXT,
    "publicId" TEXT,
    "costo" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "estatus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenCarrusel" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "estatus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "imagenCarrusel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "descripcion" TEXT,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "estatus" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pagos_alumno_id_idx" ON "pagos"("alumno_id");

-- CreateIndex
CREATE INDEX "pagos_mes_correspondiente_idx" ON "pagos"("mes_correspondiente");

-- CreateIndex
CREATE INDEX "pagos_estado_pago_idx" ON "pagos"("estado_pago");

-- CreateIndex
CREATE INDEX "asistencias_alumno_id_idx" ON "asistencias"("alumno_id");

-- CreateIndex
CREATE INDEX "asistencias_fecha_idx" ON "asistencias"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_alumno_id_fecha_key" ON "asistencias"("alumno_id", "fecha");

-- CreateIndex
CREATE INDEX "combates_alumno_id_idx" ON "combates"("alumno_id");

-- CreateIndex
CREATE INDEX "combates_fecha_idx" ON "combates"("fecha");

-- CreateIndex
CREATE INDEX "resenas_estado_idx" ON "resenas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "User_usuario_key" ON "User"("usuario");

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combates" ADD CONSTRAINT "combates_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
