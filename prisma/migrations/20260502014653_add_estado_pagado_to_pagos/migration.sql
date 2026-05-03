/*
  Warnings:

  - The values [PAGADO,ABONO,PENDIENTE,VENCIDO] on the enum `EstadoPago` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoPago_new" AS ENUM ('COMPLETO', 'PARCIAL');
ALTER TABLE "public"."pagos" ALTER COLUMN "estado_pago" DROP DEFAULT;
ALTER TABLE "pagos" ALTER COLUMN "estado_pago" TYPE "EstadoPago_new" USING ("estado_pago"::text::"EstadoPago_new");
ALTER TYPE "EstadoPago" RENAME TO "EstadoPago_old";
ALTER TYPE "EstadoPago_new" RENAME TO "EstadoPago";
DROP TYPE "public"."EstadoPago_old";
ALTER TABLE "pagos" ALTER COLUMN "estado_pago" SET DEFAULT 'PARCIAL';
COMMIT;

-- AlterTable
ALTER TABLE "pagos" ALTER COLUMN "estado_pago" SET DEFAULT 'PARCIAL';
