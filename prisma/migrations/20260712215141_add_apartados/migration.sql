-- CreateEnum
CREATE TYPE "EstadoApartado" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "apartados" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "totalAbonado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado" "EstadoApartado" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_apartado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite" DATE,
    "fecha_liquidacion" TIMESTAMP(3),
    "notas" TEXT,
    "usuario_id" INTEGER,
    "venta_id" INTEGER,

    CONSTRAINT "apartados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_apartado" (
    "id" SERIAL NOT NULL,
    "apartado_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(8,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_apartado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonos_apartado" (
    "id" SERIAL NOT NULL,
    "apartado_id" INTEGER NOT NULL,
    "monto" DECIMAL(8,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "notas" TEXT,
    "usuario_id" INTEGER,

    CONSTRAINT "abonos_apartado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apartados_venta_id_key" ON "apartados"("venta_id");

-- CreateIndex
CREATE INDEX "apartados_alumno_id_idx" ON "apartados"("alumno_id");

-- CreateIndex
CREATE INDEX "apartados_estado_idx" ON "apartados"("estado");

-- CreateIndex
CREATE INDEX "detalle_apartado_apartado_id_idx" ON "detalle_apartado"("apartado_id");

-- CreateIndex
CREATE INDEX "abonos_apartado_apartado_id_idx" ON "abonos_apartado"("apartado_id");

-- AddForeignKey
ALTER TABLE "apartados" ADD CONSTRAINT "apartados_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartados" ADD CONSTRAINT "apartados_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "Venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_apartado" ADD CONSTRAINT "detalle_apartado_apartado_id_fkey" FOREIGN KEY ("apartado_id") REFERENCES "apartados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_apartado" ADD CONSTRAINT "detalle_apartado_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonos_apartado" ADD CONSTRAINT "abonos_apartado_apartado_id_fkey" FOREIGN KEY ("apartado_id") REFERENCES "apartados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
