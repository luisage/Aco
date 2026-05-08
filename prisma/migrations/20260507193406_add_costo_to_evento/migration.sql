/*
  Warnings:

  - Added the required column `costo` to the `Evento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlumnoEvento" ADD COLUMN IF NOT EXISTS "pagado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN IF NOT EXISTS "costo" INTEGER NOT NULL DEFAULT 0;
