/*
  Warnings:

  - You are about to drop the column `courierName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPickupTime` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[deliveryId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "courierName",
DROP COLUMN "deliveryPickupTime",
ADD COLUMN     "courierLocationLat" DOUBLE PRECISION,
ADD COLUMN     "courierLocationLng" DOUBLE PRECISION,
ADD COLUMN     "courierRating" TEXT,
ADD COLUMN     "courierVehicleColor" TEXT,
ADD COLUMN     "courierVehicleMake" TEXT,
ADD COLUMN     "courierVehicleModel" TEXT,
ADD COLUMN     "courierVehicleType" TEXT,
ADD COLUMN     "lastUpdated" TIMESTAMP(3),
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "refundFees" TEXT,
ADD COLUMN     "refundItems" TEXT,
ADD COLUMN     "refundPartyAtFault" TEXT,
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "uberStatus" TEXT,
ADD COLUMN     "uberTrackingUrl" TEXT,
ALTER COLUMN "deliveryStatus" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "Order_deliveryId_key" ON "Order"("deliveryId");
