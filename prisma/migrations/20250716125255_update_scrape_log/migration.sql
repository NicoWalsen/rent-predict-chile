-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScrapeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'started',
    "message" TEXT NOT NULL DEFAULT '',
    "totalProcessed" INTEGER NOT NULL DEFAULT 0,
    "totalCreated" INTEGER NOT NULL DEFAULT 0,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB
);
INSERT INTO "new_ScrapeLog" ("created", "durationMs", "id", "startedAt", "updated") SELECT "created", "durationMs", "id", "startedAt", "updated" FROM "ScrapeLog";
DROP TABLE "ScrapeLog";
ALTER TABLE "new_ScrapeLog" RENAME TO "ScrapeLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
