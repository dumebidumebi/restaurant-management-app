-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "dasherName" TEXT,
ADD COLUMN     "dasherPhone" TEXT,
ADD COLUMN     "doordashFee" DOUBLE PRECISION,
ADD COLUMN     "doordashStatus" TEXT,
ADD COLUMN     "doordashTrackingUrl" TEXT,
ADD COLUMN     "dropoffTimeEstimated" TIMESTAMP(3),
ADD COLUMN     "pickupTimeEstimated" TIMESTAMP(3),
ADD COLUMN     "supportReference" TEXT;
