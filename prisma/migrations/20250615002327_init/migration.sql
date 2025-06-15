-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "comuna" TEXT NOT NULL,
    "m2" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_comuna_m2_key" ON "Listing"("comuna", "m2");
