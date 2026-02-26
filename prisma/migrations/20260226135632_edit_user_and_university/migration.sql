/*
  Warnings:

  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SchoolToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "School_placeId_key";

-- DropIndex
DROP INDEX "School_domain_key";

-- DropIndex
DROP INDEX "_SchoolToUser_B_index";

-- DropIndex
DROP INDEX "_SchoolToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "School";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_SchoolToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "University" (
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "universityId" INTEGER,
    CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatar", "created_at", "email", "id", "password", "updated_at", "username") SELECT "avatar", "created_at", "email", "id", "password", "updated_at", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "University_domain_key" ON "University"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "University_placeId_key" ON "University"("placeId");
