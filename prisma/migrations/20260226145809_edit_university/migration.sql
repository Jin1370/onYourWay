/*
  Warnings:

  - You are about to drop the column `photoReference` on the `University` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_University" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "country" TEXT,
    "domain" TEXT,
    "placeId" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "address" TEXT,
    "photoUrl" TEXT,
    "googleRating" REAL,
    "googleReviews" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_University" ("address", "country", "created_at", "domain", "googleRating", "googleReviews", "id", "lat", "lng", "name", "placeId", "updated_at", "website") SELECT "address", "country", "created_at", "domain", "googleRating", "googleReviews", "id", "lat", "lng", "name", "placeId", "updated_at", "website" FROM "University";
DROP TABLE "University";
ALTER TABLE "new_University" RENAME TO "University";
CREATE UNIQUE INDEX "University_domain_key" ON "University"("domain");
CREATE UNIQUE INDEX "University_placeId_key" ON "University"("placeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
