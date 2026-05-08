-- CreateTable
CREATE TABLE "pagos_evento" (
    "id" SERIAL NOT NULL,
    "alumno_evento_id" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "fecha_pago" DATE NOT NULL,
    "notas" TEXT,
    "registrado_por" VARCHAR(100),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_evento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pagos_evento_alumno_evento_id_idx" ON "pagos_evento"("alumno_evento_id");

-- AddForeignKey
ALTER TABLE "pagos_evento" ADD CONSTRAINT "pagos_evento_alumno_evento_id_fkey" FOREIGN KEY ("alumno_evento_id") REFERENCES "AlumnoEvento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
