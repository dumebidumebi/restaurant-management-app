/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `availability` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openHours` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availability` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availability` to the `Modifier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availability` to the `ModifierGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_ownerId_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "availability" JSONB NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "restaurantId",
ADD COLUMN     "openHours" JSONB NOT NULL,
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "locationId",
ADD COLUMN     "availability" JSONB NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Modifier" ADD COLUMN     "availability" JSONB NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ModifierGroup" ADD COLUMN     "availability" JSONB NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Restaurant";

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MenuLocations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MenuLocations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_ownerId_key" ON "Store"("ownerId");

-- CreateIndex
CREATE INDEX "_MenuLocations_B_index" ON "_MenuLocations"("B");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuLocations" ADD CONSTRAINT "_MenuLocations_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuLocations" ADD CONSTRAINT "_MenuLocations_B_fkey" FOREIGN KEY ("B") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
