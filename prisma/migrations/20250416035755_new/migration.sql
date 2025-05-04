/*
  Warnings:

  - You are about to drop the column `stripeCheckoutSessionId` on the `Order` table. All the data in the column will be lost.
  - The `refundFees` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `refundItems` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[stripeProductId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePriceId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeProductId]` on the table `Modifier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePriceId]` on the table `Modifier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentIntentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdAt` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "DeliveryStatus" ADD VALUE 'CANCELED';

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "displayName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Location" ALTER COLUMN "openHours" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Menu" ALTER COLUMN "availability" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Modifier" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "ModifierGroup" ALTER COLUMN "minSelect" SET DEFAULT 0,
ALTER COLUMN "maxSelect" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "stripeCheckoutSessionId",
ADD COLUMN     "refundId" TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
DROP COLUMN "refundFees",
ADD COLUMN     "refundFees" JSONB,
DROP COLUMN "refundItems",
ADD COLUMN     "refundItems" JSONB;

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "settings" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "data" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Item_stripeProductId_key" ON "Item"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_stripePriceId_key" ON "Item"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Modifier_stripeProductId_key" ON "Modifier"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Modifier_stripePriceId_key" ON "Modifier"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON "Order"("paymentIntentId");
