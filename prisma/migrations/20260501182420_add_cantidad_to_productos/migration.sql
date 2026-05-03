/*
  Warnings:

  - Added the required column `cantidad` to the `productos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "cantidad" INTEGER NOT NULL,
ADD COLUMN     "descripcionVenta" TEXT;
