-- AlterTable
ALTER TABLE "Evento" ALTER COLUMN "costo" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Novedades" ADD COLUMN     "imagen" TEXT,
ADD COLUMN     "publicId" TEXT;
