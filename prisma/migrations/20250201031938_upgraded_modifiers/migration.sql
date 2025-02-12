/*
  Warnings:

  - You are about to drop the column `modifierGroupId` on the `Modifier` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `ModifierGroup` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Modifier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ModifierGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Modifier" DROP CONSTRAINT "Modifier_modifierGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ModifierGroup" DROP CONSTRAINT "ModifierGroup_itemId_fkey";

-- AlterTable
ALTER TABLE "Modifier" DROP COLUMN "modifierGroupId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "availability" DROP NOT NULL,
ALTER COLUMN "isAvailable" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ModifierGroup" DROP COLUMN "itemId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "availability" DROP NOT NULL,
ALTER COLUMN "isAvailable" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_ItemModifierGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemModifierGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ModifierGroupModifiers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ModifierGroupModifiers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ItemModifierGroups_B_index" ON "_ItemModifierGroups"("B");

-- CreateIndex
CREATE INDEX "_ModifierGroupModifiers_B_index" ON "_ModifierGroupModifiers"("B");

-- AddForeignKey
ALTER TABLE "ModifierGroup" ADD CONSTRAINT "ModifierGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modifier" ADD CONSTRAINT "Modifier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemModifierGroups" ADD CONSTRAINT "_ItemModifierGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemModifierGroups" ADD CONSTRAINT "_ItemModifierGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModifierGroupModifiers" ADD CONSTRAINT "_ModifierGroupModifiers_A_fkey" FOREIGN KEY ("A") REFERENCES "Modifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModifierGroupModifiers" ADD CONSTRAINT "_ModifierGroupModifiers_B_fkey" FOREIGN KEY ("B") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
