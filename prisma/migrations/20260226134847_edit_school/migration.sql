/*
  Warnings:

  - Added the required column `placeId` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_School" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "country" TEXT,
    "domain" TEXT,
    "placeId" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "address" TEXT,
    "photoReference" TEXT,
    "googleRating" REAL,
    "googleReviews" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_School" ("country", "created_at", "domain", "id", "name", "updated_at", "website") SELECT "country", "created_at", "domain", "id", "name", "updated_at", "website" FROM "School";
DROP TABLE "School";
ALTER TABLE "new_School" RENAME TO "School";
CREATE UNIQUE INDEX "School_domain_key" ON "School"("domain");
CREATE UNIQUE INDEX "School_placeId_key" ON "School"("placeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
