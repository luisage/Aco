/*
  Warnings:

  - You are about to drop the column `pagado` on the `AlumnoEvento` table. All the data in the column will be lost.
  - You are about to drop the column `costo` on the `Evento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AlumnoEvento" DROP COLUMN "pagado";

-- AlterTable
ALTER TABLE "Evento" DROP COLUMN "costo";
