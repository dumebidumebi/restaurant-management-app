/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[site_subdomain]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "site_cover_image" TEXT,
ADD COLUMN     "site_custom_domain" TEXT,
ADD COLUMN     "site_logo" TEXT,
ADD COLUMN     "site_subdomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Store_id_key" ON "Store"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Store_site_subdomain_key" ON "Store"("site_subdomain");
