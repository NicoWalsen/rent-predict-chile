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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Listing" ("comuna", "createdAt", "id", "m2", "precio", "updatedAt") SELECT "comuna", "createdAt", "id", "m2", "precio", "updatedAt" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_comuna_m2_estacionamientos_bodega_key" ON "Listing"("comuna", "m2", "estacionamientos", "bodega");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
