/*
  Warnings:

  - You are about to drop the column `attributes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "attributes",
DROP COLUMN "material";

-- CreateTable
CREATE TABLE "ProductSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "model" TEXT,
    "weightKg" DOUBLE PRECISION,
    "shapes" TEXT[],
    "styles" TEXT[],
    "rooms" TEXT[],
    "lampType" TEXT,
    "maxAreaM2" DOUBLE PRECISION,
    "mountingType" TEXT,
    "packageSize" TEXT,
    "frameMaterial" TEXT,
    "frameColor" TEXT,
    "shadeMaterials" TEXT[],
    "shadeColors" TEXT[],
    "colorTemps" TEXT[],
    "powerW" INTEGER,
    "lumens" INTEGER,
    "lampCount" INTEGER,

    CONSTRAINT "ProductSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpec_productId_key" ON "ProductSpec"("productId");

-- AddForeignKey
ALTER TABLE "ProductSpec" ADD CONSTRAINT "ProductSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
