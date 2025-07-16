-- CreateTable
CREATE TABLE "Listing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "comuna" TEXT NOT NULL,
    "m2" INTEGER NOT NULL,
    "precio" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created" INTEGER NOT NULL,
    "updated" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_comuna_m2_key" ON "Listing"("comuna", "m2");
