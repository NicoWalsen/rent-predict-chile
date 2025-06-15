-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" SERIAL NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created" INTEGER NOT NULL,
    "updated" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);
