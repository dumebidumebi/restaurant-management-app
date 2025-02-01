-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "availability" JSONB,
ADD COLUMN     "isAvailable" BOOLEAN DEFAULT true;
