-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "comuna" TEXT NOT NULL,
    "m2" INTEGER NOT NULL,
    "precio" REAL NOT NULL,
    "estacionamientos" INTEGER NOT NULL DEFAULT 0,
    "bodega" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "sourceUrl" TEXT,
    "sourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Listing" ("bodega", "comuna", "createdAt", "estacionamientos", "id", "m2", "precio", "updatedAt") SELECT "bodega", "comuna", "createdAt", "estacionamientos", "id", "m2", "precio", "updatedAt" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_comuna_m2_estacionamientos_bodega_sourceId_key" ON "Listing"("comuna", "m2", "estacionamientos", "bodega", "sourceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
