-- CreateEnum
CREATE TYPE "CharacteristicsType" AS ENUM ('model', 'weightKg', 'shapes', 'styles', 'rooms', 'lampType', 'maxAreaM2', 'mountingType', 'packageSize', 'frameMaterial', 'frameColor', 'shadeMaterials', 'shadeColors', 'colorTemps', 'powerW', 'lumens', 'lampCount');

-- CreateTable
CREATE TABLE "Characteristics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CharacteristicsType" NOT NULL,

    CONSTRAINT "Characteristics_pkey" PRIMARY KEY ("id")
);
