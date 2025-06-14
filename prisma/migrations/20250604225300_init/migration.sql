-- CreateEnum
CREATE TYPE "Source" AS ENUM ('PORTALINMOBILIARIO', 'YAPO');

-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" "Source" NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "commune" TEXT NOT NULL,
    "areaM2" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "rentCLP" INTEGER NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_externalId_key" ON "Listing"("externalId");
